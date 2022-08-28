package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	log.Println("Starting homebridge-g810-led client...")
	defer log.Println("Shut down homebridge-g810-led client.")

	server, command, disableWhenIdle := parseFlags()

	if disableWhenIdle {
		dbus := connectToDbus(command)
		defer dbus.Close()
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	conn, err := connectWS(server, ctx)

	if err != nil {
		log.Printf("Failed to connect to ws server at %s: %v\n", server, err)
		log.Println("No server, defaulting to 100% white");

		setColor(Color{255, 255, 255}, command)
		// Do nothing else.
		for {}
	} else {
		defer conn.Close()
		log.Println("Connected to websocket server.")
	
		wsChan := buildWsRecvChan(conn)
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	
		for {
			select {
			case msg := <-wsChan:
				handleWSMessage(msg, command)
			case <-sigChan:
				return
			}
		}
	}
}

func parseFlags() (server, command string, disableWhenIdle bool) {
	flag.StringVar(&server, "server", "", "the server with protocol and port where homebridge-g810-led is installed.")
	flag.StringVar(&command, "command", "", "the g810-led type command for your exact keyboard model.")
	flag.BoolVar(&disableWhenIdle, "disableWhenIdle", false, "disable lighting of your keyboard when your computer is idling")

	flag.Parse()

	if !isCommandValid(command) {
		log.Fatalln("Command flag is missing or invalid.")
	}
	if server == "" {
		log.Fatalln("Websocket server flag is missing")
	}
	return
}
