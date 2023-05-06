package input

import (
	"context"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"github.com/wanjohiryan/warp/internal/config"

	"github.com/go-vgo/robotgo"
	"github.com/kixelated/invoker"
	"github.com/kixelated/quic-go"
	"github.com/kixelated/webtransport-go"
)

// A single WebTransport session
type Session struct {
	conn  quic.Connection
	inner *webtransport.Session

	streams invoker.Tasks
}

func NewSession(connection quic.Connection, session *webtransport.Session) (s *Session, err error) {
	s = new(Session)
	s.conn = connection
	s.inner = session
	return s, nil
}

func (s *Session) Run(ctx context.Context) (err error) {

	// Once we've validated the session, now we can start accessing the streams
	return invoker.Run(ctx, s.runAccept, s.runAcceptUni, s.streams.Repeat)
}

func (s *Session) runAccept(ctx context.Context) (err error) {
	for {
		stream, err := s.inner.AcceptStream(ctx)
		if err != nil {
			return fmt.Errorf("failed to accept bidirectional stream: %w", err)
		}

		// Warp doesn't utilize bidirectional streams so just close them immediately.
		// We might use them in the future so don't close the connection with an error.
		stream.CancelRead(1)
	}
}

func (s *Session) runAcceptUni(ctx context.Context) (err error) {
	for {
		stream, err := s.inner.AcceptUniStream(ctx)
		if err != nil {
			return fmt.Errorf("failed to accept unidirectional stream: %w", err)
		}

		s.streams.Add(func(ctx context.Context) (err error) {
			return s.handleStream(ctx, stream)
		})
	}
}

func (s *Session) handleStream(ctx context.Context, stream webtransport.ReceiveStream) (err error) {
	defer func() {
		if err != nil {
			stream.CancelRead(1)
		}
	}()

	var header [8]byte
	for {
		_, err = io.ReadFull(stream, header[:])
		if errors.Is(io.EOF, err) {
			return nil
		} else if err != nil {
			return fmt.Errorf("failed to read atom header: %w", err)
		}

		size := binary.BigEndian.Uint32(header[0:4])
		name := string(header[4:8])

		if size < 8 {
			return fmt.Errorf("atom size is too small")
		} else if size > 42069 { // arbitrary limit
			return fmt.Errorf("atom size is too large")
		} else if name != "warp" {
			return fmt.Errorf("only warp atoms are supported")
		}

		payload := make([]byte, size-8)

		_, err = io.ReadFull(stream, payload)
		if err != nil {
			return fmt.Errorf("failed to read atom payload: %w", err)
		}

		// log.Println("received message:", string(payload))

		msg := Message{}

		err = json.Unmarshal(payload, &msg)
		if err != nil {
			return fmt.Errorf("failed to decode json payload: %w", err)
		}

		// fmt.Print(msg)

		// if msg.Move != nil {
		// 	robotgo.Move(int(msg.Move.x), int(msg.Move.x))
		// }

		if msg.Press != nil {
			robotgo.KeyTap(config.RobotGoJSKeyMap[msg.Press.Key])
		}

		if msg.Click != nil {
			//TODO: implement double click
			robotgo.Click(msg.Click.Button)
		}

		if msg.Move != nil {
			robotgo.MoveRelative(int(msg.Move.x), int(msg.Move.y))
		}

		if msg.Scroll != nil {
			robotgo.Scroll(int(msg.Scroll.x), int(msg.Scroll.y))
		}

		// if msg.Debug != nil {
		// 	s.setDebug(msg.Debug)
		// }
	}
}

// func (s *Session) setDebug(msg *MessageDebug) {
// 	s.conn.SetMaxBandwidth(uint64(msg.MaxBitrate))
// }
