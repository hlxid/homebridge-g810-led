package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"nhooyr.io/websocket"
)

func main() {
	log.Println("Starting homebridge-g810-led client...")
	defer log.Println("Shut down homebridge-g810-led client.")

	server, command := parseFlags()

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	conn := connectWS(server, ctx)
	defer conn.Close(websocket.StatusInternalError, "stopped client")
	log.Println("Connected to websocket server.")

	wsChan := buildWsRecvChan(conn, ctx)
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	for {
		select {
		case msg := <-wsChan: handleWSMessage(msg, command)
		case <-sigChan: return
		}
	}
}

func parseFlags() (server, command string) {
	flag.StringVar(&server, "server", "", "the server with protocol and port where homebridge-g810-led is installed.")
	flag.StringVar(&command, "command", "", "the g810-led type command for your exact keyboard model.")

	flag.Parse()

	if !isCommandValid(command) {
		log.Fatalln("Command flag is missing or invalid.")
	}
	if server == "" {
		log.Fatalln("Websocket server flag is missing")
	}
	return
}
