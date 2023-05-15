package input

type Message struct {
	Press  *MessageKeyPress    `json:"keypress,omitempty"`
	Move   *MessageMouseMove   `json:"mousemove,omitempty"`
	Click  *MessageMouseClick  `json:"mouseclick,omitempty"`
	Scroll *MessageMouseScroll `json:"mousescroll,omitempty"`
}

type MessageKeyPress struct {
	//FIXME: use key instead
	Key float64 `json:"key"` // Key pressed
}

type MessageMouseMove struct {
	x int `json:"x"` // relative x value of the  mouse cursor
	y int `json:"y"` // relative y value of the  mouse cursor
}

type MessageMouseClick struct {
	Button string `json:"button"` // Button pressed
}

type MessageMouseScroll struct {
	x int `json:"x"` // relative x value
	y int `json:"y"` // relative y value
}
