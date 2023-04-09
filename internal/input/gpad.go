package input

import (
	"fmt"

	"github.com/bendahl/uinput"
)

// {
// 	"buttons": ["UP", "RIGHT", "LB", "A", "X"],
// 	"left_trigger": 128,
// 	"right_trigger": 0,
// 	"thumb_lx": 32767,
// 	"thumb_ly": -32768,
// 	"thumb_rx": -32768,
// 	"thumb_ry": 32767
// }

var btnMap = map[string]int{
	"A":     uinput.ButtonNorth,
	"B":     uinput.ButtonEast,
	"X":     uinput.ButtonWest,
	"Y":     uinput.ButtonSouth,
	"UP":    uinput.ButtonDpadUp,
	"DOWN":  uinput.ButtonDpadDown,
	"LEFT":  uinput.ButtonDpadLeft,
	"RIGHT": uinput.ButtonDpadRight,
	"LB":    uinput.ButtonBumperLeft,
	"RB":    uinput.ButtonBumperRight,
	"BACK":  uinput.ButtonSelect,
	"START": uinput.ButtonStart,
	"LS":    uinput.ButtonThumbLeft,
	"RS":    uinput.ButtonThumbRight,
	//FIXME: implement this buttons using analogue values =< 278
	"TR": uinput.ButtonTriggerRight,
	"TL": uinput.ButtonTriggerLeft,
}

type Vgamepad struct {
	vg uinput.Gamepad
}

func NewGamepad() *Vgamepad {
	vg, err := uinput.CreateGamepad("/dev/uinput", []byte("Xbox Series X 1"), 0x045E, 0x0B00)
	if err != nil {
		fmt.Println("Got an error trying to create a gamepad", err)
	}
	return &Vgamepad{vg: vg}
}

// func (v Vgamepad) SetBtn(function string, arg int) {
func (v Vgamepad) SetBtn(function string) {
	// if function == "Dpad" {
	// 	v.vg.Dpad(arg)
	// } else {
	// 	v.vg.BtnEv(btnMap[function], arg)
	// }
	v.vg.ButtonPress(btnMap[function])
}

func (v Vgamepad) LeftAxis(x float64, y float64) {
	v.vg.LeftStickMove(float32(x), float32(y))
}

func (v Vgamepad) RightAxis(x float64, y float64) {
	v.vg.RightStickMove(float32(x), float32(y))
}

func (v Vgamepad) UnPlug() {
	v.vg.Close()
}

// func gamepadExists(name string) bool {
// 	devices, err := os.ReadFile("/proc/bus/input/devices")
// 	if err != nil {
// 		fmt.Print("Error accessing input devices file")
// 	}
// 	return strings.Contains(string(devices), name)
// }
