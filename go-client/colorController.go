package main

import (
	"encoding/json"
	"fmt"
	"os/exec"
)

const dimSteps = 15

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

func setColor(c Color, command string) error {
	color = c
	return applyColor(command, c)
}

func turnOff(command string) error {
	r, g, b := float64(color.Red), float64(color.Green), float64(color.Blue)
	for i := dimSteps - 1; i >= 0; i-- {
		c := Color{
			Red:   uint8(r * float64(i) / dimSteps),
			Green: uint8(g * float64(i) / dimSteps),
			Blue: uint8(b * float64(i) / dimSteps),
		}
		if err := applyColor(command, c); err != nil {
			return err
		}
	}

	return nil
}

func turnOn(command string) error {
	r, g, b := float64(color.Red), float64(color.Green), float64(color.Blue)
	for i := 1; i <= dimSteps; i++ {
		c := Color{
			Red:   uint8(r * float64(i) / dimSteps),
			Green: uint8(g * float64(i) / dimSteps),
			Blue: uint8(b * float64(i) / dimSteps),
		}
		if err := applyColor(command, c); err != nil {
			return err
		}
	}

	return nil
}

func applyColor(command string, color Color) error {
	cmd := exec.Command(command, "-a", color.Hex())
	cmd.StderrPipe()
	cmd.StdoutPipe()
	return cmd.Run()
}
