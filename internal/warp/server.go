package warp

import (
	"context"
	"crypto/tls"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/wanjohiryan/warp/internal/ui"

	"github.com/kixelated/invoker"
	"github.com/kixelated/quic-go"
	"github.com/kixelated/quic-go/http3"
	"github.com/kixelated/quic-go/logging"
	"github.com/kixelated/quic-go/qlog"
	"github.com/kixelated/webtransport-go"
)

type Server struct {
	inner *webtransport.Server
	media *Media

	sessions invoker.Tasks
}

type ServerConfig struct {
	Addr   string
	Cert   *tls.Certificate
	LogDir string
}

func NewServer(config ServerConfig, media *Media) (s *Server, err error) {
	s = new(Server)

	quicConfig := &quic.Config{}

	if config.LogDir != "" {
		quicConfig.Tracer = qlog.NewTracer(func(p logging.Perspective, connectionID []byte) io.WriteCloser {
			path := fmt.Sprintf("%s-%s.qlog", p, hex.EncodeToString(connectionID))

			f, err := os.Create(filepath.Join(config.LogDir, path))
			if err != nil {
				// lame
				panic(err)
			}

			return f
		})
	}

	tlsConfig := &tls.Config{
		Certificates: []tls.Certificate{*config.Cert},
	}

	//first prepare the client side then 'import' the http mux handler to this side
	mux := ui.NewClient()

	s.inner = &webtransport.Server{
		H3: http3.Server{
			TLSConfig:  tlsConfig,
			QuicConfig: quicConfig,
			Addr:       config.Addr,
			Handler:    mux,
		},
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	s.media = media
	//for webtransport
	mux.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {

		gamePath, exists := os.LookupEnv("GAME_EXE")
		if !exists {
			fmt.Println("GAME_EXE environment variable not set")
			return
		}

		//TODO: Fix game running check, and use go instead of bash
		cmd := exec.Command("bash", "/etc/warp/run-wine.sh", gamePath)

		output, err := cmd.CombinedOutput()
		if err != nil {
			fmt.Println("Error running game:", err)
			return
		}

		fmt.Println("Game started successfully:", string(output))

		hijacker, ok := w.(http3.Hijacker)
		if !ok {
			panic("unable to hijack connection: must use kixelated/quic-go")
		}

		conn := hijacker.Connection()

		sess, err := s.inner.Upgrade(w, r)
		if err != nil {
			http.Error(w, "failed to upgrade session", 500)
			return
		}

		err = s.serve(r.Context(), conn, sess)
		if err != nil {
			log.Println(err)
		}
	})

	//limit players to four per session
	maxConcurrentConn := 1
	sem := make(chan struct{}, maxConcurrentConn)
	mux.HandleFunc("/play", func(w http.ResponseWriter, r *http.Request) {

		// Try to acquire a slot from the channel.
		select {

		case sem <- struct{}{}:
			defer func() {
				// Release the slot back to the channel when the request is done.
				<-sem
			}()

			hijacker, ok := w.(http3.Hijacker)
			if !ok {
				panic("unable to hijack connection: must use kixelated/quic-go")
			}

			conn := hijacker.Connection()

			sess, err := s.inner.Upgrade(w, r)
			if err != nil {
				http.Error(w, "failed to upgrade session", 500)
				return
			}

			err = s.serve(r.Context(), conn, sess)
			if err != nil {
				log.Println(err)
			}

		default:
			// If the channel is full, return an HTTP error response.
			http.Error(w, "Someone is already playing", http.StatusServiceUnavailable)
		}
	})

	return s, nil
}

func (s *Server) runServe(ctx context.Context) (err error) {
	return s.inner.ListenAndServe()
}

func (s *Server) runShutdown(ctx context.Context) (err error) {
	<-ctx.Done()
	s.inner.Close()
	return ctx.Err()
}

func (s *Server) Run(ctx context.Context) (err error) {
	return invoker.Run(ctx, s.runServe, s.runShutdown, s.sessions.Repeat)
}

func (s *Server) serve(ctx context.Context, conn quic.Connection, sess *webtransport.Session) (err error) {
	defer func() {
		if err != nil {
			sess.CloseWithError(1, err.Error())
		} else {
			sess.CloseWithError(0, "end of broadcast")
		}
	}()

	ss, err := NewSession(conn, sess, s.media)
	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}

	err = ss.Run(ctx)
	if err != nil {
		return fmt.Errorf("terminated session: %w", err)
	}

	return nil
}
