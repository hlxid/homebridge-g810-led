package main

import (
	"encoding/json"
	"fmt"
	"os/exec"
)

type Color struct {
	Red   uint8 `json:"r"`
	Green uint8 `json:"g"`
	Blue  uint8 `json:"b"`
}

func (c *Color) Hex() string {
	return fmt.Sprintf("%02x%02x%02x", c.Red, c.Green, c.Blue)
}

func ColorFromJSON(stringBytes []byte) (c Color, err error) {
	err = json.Unmarshal(stringBytes, &c)
	return
}

func isCommandValid(command string) bool {
	_, err := exec.LookPath(command)
	return err == nil
}

var color Color
var isEnabled bool = true

func setColor(c Color, command string) error {
	color = c
	return applyColor(command)
}

func turnOff(command string) error {
	isEnabled = false
	return applyColor(command)
}

func turnOn(command string) error {
	isEnabled = true
	return applyColor(command)
}

func applyColor(command string) error {
	c := color
	// Keyboard lighting is disabled, set to black
	if !isEnabled {
		c = Color{
			Red:   0,
			Green: 0,
			Blue:  0,
		}
	}

	cmd := exec.Command(command, "-a", c.Hex())
	cmd.StderrPipe()
	cmd.StdoutPipe()
	return cmd.Run()
}
