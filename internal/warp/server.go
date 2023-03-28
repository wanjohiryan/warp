package warp

import (
	"context"
	"crypto/rand"
	"crypto/tls"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/golang-jwt/jwt"
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

type MyCustomClaims struct {
	jwt.StandardClaims
	Role     string `json:"role"`
	Password string `json:"password"`
}

func NewServer(config ServerConfig, media *Media) (s *Server, err error) {
	s = new(Server)

	quicConfig := &quic.Config{}

	// Generate a random secret key for JWT token signing and verification
	//FIXME:is this really secure?
	secretKey := generateRandomKey(32)

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
	maxConcurrentConn := 4
	sem := make(chan struct{}, maxConcurrentConn)

	mux.HandleFunc("/play", func(w http.ResponseWriter, r *http.Request) {
		// Try to acquire a slot from the channel.
		select {
		case sem <- struct{}{}:
			defer func() {
				// Release the slot back to the channel when the request is done.
				<-sem
			}()

			s.servePlayers(w, r, secretKey)

		default:
			// If the channel is full, return an HTTP error response.
			http.Error(w, "Slots are full", http.StatusServiceUnavailable)
		}

	})
	mux.HandleFunc("/admin", func(w http.ResponseWriter, r *http.Request) {})

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

func (s *Server) servePlay(ctx context.Context, conn quic.Connection, sess *webtransport.Session) (err error) {
	defer func() {
		if err != nil {
			sess.CloseWithError(1, err.Error())
		} else {
			sess.CloseWithError(0, "end of broadcast")
		}
	}()

	ss, err := NewPlaySession(conn, sess, s.media)
	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}

	err = ss.Play(ctx)
	if err != nil {
		return fmt.Errorf("terminated session: %w", err)
	}

	return nil
}

func (s *Server) servePlayers(w http.ResponseWriter, r *http.Request, secretKey string) (err error) {
	//check whether this has elevated privileges
	//in the form of `/api?t={token}`
	tokenString := r.URL.Query().Get("t")
	if tokenString == "" {
		http.Error(w, "missing token", http.StatusBadRequest)
		return
	}

	token, err := jwt.ParseWithClaims(tokenString, &MyCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if !token.Valid {
		http.Error(w, "invalid token", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "invalid claims", http.StatusBadRequest)
		return
	}

	role, ok := claims["role"].(string)
	if !ok {
		http.Error(w, "invalid role", http.StatusBadRequest)
		return
	}

	password, ok := claims["password"].(string)
	if !ok {
		http.Error(w, "invalid password", http.StatusBadRequest)
		return
	}

	warpPassword := os.Getenv("WARP_PASSWORD")

	if password != warpPassword {
		http.Error(w, "invalid password", http.StatusBadRequest)
		return
	}

	if role != "admin" && role != "player" {
		http.Error(w, "invalid role", http.StatusBadRequest)
		return
	}

	//upgrade connection to webtransport
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

	err = s.servePlay(r.Context(), conn, sess)
	if err != nil {
		log.Println(err)
	}

	return nil
}

func generateRandomKey(n int) string {
	b := make([]byte, n)
	_, err := rand.Read(b)
	if err != nil {
		log.Fatal(err)
	}

	return base64.URLEncoding.EncodeToString(b)
}

func (c *MyCustomClaims) Valid() error {
	return nil
}

func (c *MyCustomClaims) ValidFor() error {
	return nil
}
