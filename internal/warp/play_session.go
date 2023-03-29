package warp

import (
	"context"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"time"

	"github.com/kixelated/invoker"
	"github.com/kixelated/quic-go"
	"github.com/kixelated/webtransport-go"
)

// TODO: create a heartbeat stream, to get the exact latency between the server and client

// A single WebTransport session
type PlaySession struct {
	conn  quic.Connection
	inner *webtransport.Session

	pad *Gpad

	streams invoker.Tasks
}

func NewPlaySession(connection quic.Connection, session *webtransport.Session, gpad *Gpad) (s *PlaySession, err error) {
	s = new(PlaySession)
	s.conn = connection
	s.inner = session
	s.pad = gpad
	return s, nil
}

func (s *PlaySession) Play(ctx context.Context) (err error) {
	return invoker.Run(ctx, s.runAcceptPlay, s.handleVibrations, s.heartPlayBeat)
}

func (s *PlaySession) runAcceptPlay(ctx context.Context) (err error) {
	//TODO: handle gamepad input with a bidirectional stream ?
	// s.streams.Add(func(ctx context.Context) (err error) {
	// 	return s.handleGamepads(ctx, stream)
	// })
	// Warp doesn't utilize bidirectional streams so just close them immediately.
	// We might use them in the future so don't close the connection with an error.
	for {
		stream, err := s.inner.AcceptUniStream(ctx)
		if err != nil {
			return fmt.Errorf("failed to accept unidirectional stream: %w", err)
		}

		s.streams.Add(func(ctx context.Context) (err error) {
			return s.handlePlayStream(ctx, stream)
		})
	}
}

func (s *PlaySession) handlePlayStream(ctx context.Context, stream webtransport.ReceiveStream) (err error) {
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

		msg := Message{}

		err = json.Unmarshal(payload, &msg)
		if err != nil {
			return fmt.Errorf("failed to decode json payload: %w", err)
		}

		if msg.Pad != nil {
			s.pad.SendInput(*msg.Pad)
		}
	}
}

// get latency between server and client via a heartbeat uni-stream
func (s *PlaySession) heartPlayBeat(ctx context.Context) (err error) {

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

		//every 2 seconds
		time.Sleep(2 * time.Second)
	}
}

func (s *PlaySession) handleVibrations(ctx context.Context) (err error) {

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

		v := s.pad.ReceiveVibrations()

		err = stream.WriteMessage(Message{
			Notification: &VibrationState{
				LargeMotor: v.LargeMotor,
				SmallMotor: v.SmallMotor,
			},
		})

		if err != nil {
			return fmt.Errorf("failed to write heart beat: %w", err)
		}

		//every 2 seconds
		time.Sleep(2 * time.Second)
	}
}

// // set max bitrate for bandwidth
// func (s *Session) setDebug(msg *MessageDebug) {
// 	s.conn.SetMaxBandwidth(uint64(msg.MaxBitrate))
// }
