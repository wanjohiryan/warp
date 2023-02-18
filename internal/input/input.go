package input

import (
	"log"
	"os"
)

const (
	evSyn = 0x00
	evKey = 0x01
	evRel = 0x02
	evAbs = 0x03
	evMsc = 0x04

	btnLeft = 0x110
)

func mouse() {
	dev := "/dev/input/mouse0"
	file, err := os.OpenFile(dev, os.O_WRONLY, 0666)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	// create left mouse button press event
	ev := []byte{0x01, byte(btnLeft & 0xff), byte((btnLeft >> 8) & 0xff), 0x01}
	_, err = file.Write(ev)
	if err != nil {
		log.Fatal(err)
	}

	// create left mouse button release event
	ev = []byte{0x01, byte(btnLeft & 0xff), byte((btnLeft >> 8) & 0xff), 0x00}
	_, err = file.Write(ev)
	if err != nil {
		log.Fatal(err)
	}
}
