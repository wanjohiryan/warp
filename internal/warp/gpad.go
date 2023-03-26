package warp

// import websocket stuff here
import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Gpad struct {
	pad *websocket.Conn
}

type VibrationState struct {
	LeftTrigger  int `json:"large_motor"`
	RightTrigger int `json:"small_motor"`
}

type ControllerState struct {
	Buttons      []string `json:"buttons"`
	LeftTrigger  int      `json:"left_trigger"`
	RightTrigger int      `json:"right_trigger"`
	ThumbLX      int      `json:"thumb_lx"`
	ThumbLY      int      `json:"thumb_ly"`
	ThumbRX      int      `json:"thumb_rx"`
	ThumbRY      int      `json:"thumb_ry"`
}

// create a new virtual gpad [maximum is 4]
func NewGamepad() (s *Gpad, err error) {
	s = new(Gpad)

	// Create a WebSocket dialer
	dialer := websocket.Dialer{}

	// Connect to the WebSocket server
	conn, _, err := dialer.Dial("ws://localhost:9002", http.Header{})
	if err != nil {
		log.Fatal("Failed to connect to websocket server:", err)
	}
	defer conn.Close()

	s.pad = conn

	return s, nil
}

// send input to our virtual gpad
func (s *Gpad) SendInput(message ControllerState) {
	// Send a message to the server
	if err := s.pad.WriteJSON(message); err != nil {
		log.Fatal("Failed to send message:", err)
	}
}

// receive vibrations to our virtual gpad
func (s *Gpad) ReceiveVibrations() (myMsg VibrationState, err error) {
	// Read a message from the server
	_, message, err := s.pad.ReadMessage()
	if err != nil {
		log.Fatal("Failed to read message:", err)
	}

	// Decode the message as JSON
	var messageData VibrationState
	if err := json.Unmarshal(message, &messageData); err != nil {
		log.Fatal("Failed to decode message:", err)
	}

	return messageData, nil
}
