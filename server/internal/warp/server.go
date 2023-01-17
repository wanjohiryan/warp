package warp

import (
	"context"
	"crypto/tls"
	"embed"
	"encoding/hex"
	"fmt"
	"io"
	"io/fs"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"

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

//go:embed static
var content embed.FS

func NewServer(config ServerConfig, media *Media) (s *Server, err error) {
	s = new(Server)

	quicConfig := &quic.Config{}

	fsys := fs.FS(content)
	html, err := fs.Sub(fsys, "static")

	if err != nil {
		log.Fatal("failed to get ui fs", err)
	}

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

	mux := http.NewServeMux()

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

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		//must be aget method (browser)
		if r.Method != "GET" {
			http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
			return
		}

		path := filepath.Clean(r.URL.Path)

		//FIXME: how to solve this one

		if path == "/" || path == "" { // Add other paths that you route on the UI side here
			path = "index.html"
		}

		path = strings.TrimPrefix(path, "/")

		fmt.Println("file requested is", path)

		// http.FileServer(http.FS(html))
		file, err := html.Open("index.html")
		if err != nil {
			if os.IsNotExist(err) {
				log.Println("file", path, "not found:", err)
				http.NotFound(w, r)
				return
			}
			log.Println("file", path, "cannot be read:", err)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		contentType := mime.TypeByExtension(filepath.Ext(path))
		w.Header().Set("Content-Type", contentType)
		if strings.HasPrefix(path, "static/") {
			w.Header().Set("Cache-Control", "public, max-age=31536000")
		}
		stat, err := file.Stat()
		if err == nil && stat.Size() > 0 {
			w.Header().Set("Content-Length", fmt.Sprintf("%d", stat.Size()))
		}

		n, _ := io.Copy(w, file)

		log.Println("file", path, "copied", n, "bytes")
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
