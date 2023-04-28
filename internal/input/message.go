package input

type Message struct {
	Input       *MessageInput       `json:"input,omitempty"`
	MouseMove   *MessageMouseMove   `json:"mousemove,omitempty"`
	MouseScroll *MessageMouseScroll `json:"mousescroll,omitempty"`
	Click       *MessageClick       `json:"keyDown,omitempty"`
	Beat        *MessageHeartBeat   `json:"beat,omitempty"`
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

type MessageMouseMove struct {
	x_value float64 `json:"x"`
	y_value float64 `json:"y"`
}
type MessageMouseScroll struct {
	x_value float64 `json:"x"`
	y_value float64 `json:"y"`
}

type MessageMouseClick struct {
	button string `json:"button"`
}

type MessageClick struct {
	key int `json:"keyCode"`
}
