package input

type Message struct {
	Input *MessageInput     `json:"input,omitempty"`
	Beat  *MessageHeartBeat `json:"beat,omitempty"`
}

type MessageInput struct {
	Buttons []string `json:"buttons"`
	//FIXME: this should be used
	// LeftTrigger  int      `json:"left_trigger"`
	// RightTrigger int      `json:"right_trigger"`
	ThumbLX float64 `json:"thumb_lx"`
	ThumbLY float64 `json:"thumb_ly"`
	ThumbRX float64 `json:"thumb_rx"`
	ThumbRY float64 `json:"thumb_ry"`
}

type MessageHeartBeat struct {
	Timestamp int `json:"timestamp"`
}
