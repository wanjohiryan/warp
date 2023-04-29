package input

type Message struct {
	// Input *MessageInput     `json:"input,omitempty"`
	Keyboard    *MessageKB          `json:"keyBoard,omitempty"`
	MouseMove   *MessageMouseMove   `json:"mouseMove,omitempty"`
	MouseScroll *MessageMouseScroll `json:"mouseScroll,omitempty"`
	MouseClick  *MessageMouseClick  `json:"mouseClick,omitempty"`
	Beat        *MessageHeartBeat   `json:"beat,omitempty"`
}

// type MessageInput struct {
// 	Buttons []string `json:"buttons"`
// 	//FIXME: this should be used
// 	// LeftTrigger  int      `json:"left_trigger"`
// 	// RightTrigger int      `json:"right_trigger"`
// 	ThumbLX float64 `json:"thumb_lx"`
// 	ThumbLY float64 `json:"thumb_ly"`
// 	ThumbRX float64 `json:"thumb_rx"`
// 	ThumbRY float64 `json:"thumb_ry"`
// }

type MessageHeartBeat struct {
	Timestamp int `json:"timestamp"`
}

type MessageKB struct {
	Key int `json:"key"`
}

type MessageMouseMove struct {
	x int `json:"x"`
	y int `json:"y"`
}

type MessageMouseClick struct {
	button string `json:"button"`
}

type MessageMouseScroll struct {
	x int `json:"x"`
	y int `json:"y"`
}
