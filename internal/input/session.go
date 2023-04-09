package input

import (
	"context"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/kixelated/invoker"
	"github.com/kixelated/quic-go"
	"github.com/kixelated/webtransport-go"
)

// TODO: create a heartbeat stream, to get the exact latency between the server and client

// A single WebTransport PlayerSession
type PlayerSession struct {
	conn  quic.Connection
	inner *webtransport.Session

	gpad    *Vgamepad
	streams invoker.Tasks
}

func NewPlayerSession(connection quic.Connection, Session *webtransport.Session) (s *PlayerSession, err error) {
	s = new(PlayerSession)
	s.conn = connection
	s.inner = Session
	s.gpad = NewGamepad()
	return s, nil
}

func (s *PlayerSession) Run(ctx context.Context) (err error) {
	if err != nil {
		return fmt.Errorf("failed to start media: %w", err)
	}

	// Once we've validated the PlayerSession, now we can start accessing the streams
	return invoker.Run(ctx, s.runAccept, s.runAcceptUni, s.streams.Repeat, s.heartBeat)
}

func (s *PlayerSession) runAccept(ctx context.Context) (err error) {
	for {
		stream, err := s.inner.AcceptStream(ctx)
		if err != nil {
			return fmt.Errorf("failed to accept bidirectional stream: %w", err)
		}

		s.streams.Add(func(ctx context.Context) (err error) {
			return s.handleStream(ctx, stream)
		})
	}
}

func (s *PlayerSession) runAcceptUni(ctx context.Context) (err error) {
	for {
		stream, err := s.inner.AcceptUniStream(ctx)
		if err != nil {
			return fmt.Errorf("failed to accept unidirectional stream: %w", err)
		}

		//We use bidirectional streams for input
		s.streams.Add(func(ctx context.Context) (err error) {
			return s.handleStream(ctx, stream)
		})
	}
}

func (s *PlayerSession) handleStream(ctx context.Context, stream webtransport.ReceiveStream) (err error) {
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

		log.Println("received message:", string(payload))

		msg := Message{}

		err = json.Unmarshal(payload, &msg)
		if err != nil {
			return fmt.Errorf("failed to decode json payload: %w", err)
		}

		if msg.Input != nil {
			s.handleInput(msg.Input)
		}

		//TODO:implement automatic handling of latency issues
		if msg.Beat != nil {
			stream.CancelRead(1)
		}

	}
}

// get latency between server and client via a heartbeat stream
func (s *PlayerSession) heartBeat(ctx context.Context) (err error) {

	temp, err := s.inner.OpenUniStreamSync(ctx)
	if err != nil {
		return fmt.Errorf("failed to create stream: %w", err)
	}

	// Wrap the stream in an object that buffers writes instead of blocking.
	stream := NewStream(temp)
	s.streams.Add(stream.Run)

	defer func() {
		if err != nil {
			stream.WriteCancel(1)
		}
	}()

	start := time.Now()

	for {
		ms := int(time.Since(start).Milliseconds() / 1000)

		// newer heartbeats take priority
		stream.SetPriority(ms)

		timeNow := int(time.Now().UnixMilli())

		err = stream.WriteMessage(Message{
			Beat: &MessageHeartBeat{
				Timestamp: timeNow,
			},
		})

		if err != nil {
			return fmt.Errorf("failed to write heart beat: %w", err)
		}

		if err != nil {
			return fmt.Errorf("failed to write init data: %w", err)
		}
		//every 2 seconds
		time.Sleep(2 * time.Second)
	}
}

// handle input here
func (s *PlayerSession) handleInput(msg *MessageInput) {
	for _, str := range msg.Buttons {
		s.gpad.SetBtn(str)
	}

	s.gpad.RightAxis(msg.ThumbRX, msg.ThumbRY)

	s.gpad.LeftAxis(msg.ThumbLX, msg.ThumbLY)

}

//FIXME: destroy gamepad on player disconnect
