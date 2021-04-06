package main

import (
	"context"
	"errors"
	"log"
	"net"

	"github.com/gorilla/websocket"
)

type wsMessage struct {
	MessageType int
	Data        []byte
}

func (msg *wsMessage) StringData() string {
	return string(msg.Data)
}

func connectWS(server string, ctx context.Context) *websocket.Conn {
	conn, _, err := websocket.DefaultDialer.DialContext(ctx, server, nil)
	if err != nil {
		log.Fatalln("cannot connect to websocket server:", err)
	}

	return conn
}

func buildWsRecvChan(conn *websocket.Conn) <-chan wsMessage {
	c := make(chan wsMessage)

	go (func() {
		for {
			msgType, data, err := conn.ReadMessage()
			if err != nil {
				if errors.Is(err, net.ErrClosed) {
					log.Println("Connection has been closed.")
					return
				}

				log.Println("Error while reading message:", err)

				continue
			}

			c <- wsMessage{
				MessageType: msgType,
				Data:        data,
			}
		}
	})()

	return c
}

func handleWSMessage(msg wsMessage, command string) {
	if msg.MessageType != websocket.TextMessage {
		log.Println("Received ws message of unsupported type:", msg.MessageType)
		return
	}

	strData := msg.StringData()
	log.Println("Received ws message:", strData)

	color, err := ColorFromJSON(msg.Data)
	if err != nil {
		log.Println("Could not parse message:", err)
		return
	}

	log.Printf("Parsed color message: #%s", color.Hex())
	err = setColor(color, command)
	if err != nil {
		log.Fatalln("Could not update keyboard color:", err)
	}
}
