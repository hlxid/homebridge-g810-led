package main

import (
	"encoding/json"
	"fmt"
	"os/exec"
)

type Color struct {
	Red uint8 `json:"r"`
	Green uint8 `json:"g"`
	Blue uint8 `json:"b"`
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

func setColor(c Color, command string) error {
	cmd := exec.Command(command, "-a", c.Hex())
	cmd.StderrPipe()
	cmd.StdoutPipe()
	return cmd.Run()
}