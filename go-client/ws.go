package main

import (
	"context"
	"log"

	"nhooyr.io/websocket"
)

type wsMessage struct {
	MessageType websocket.MessageType
	Data []byte
}

func (msg *wsMessage) StringData() string {
	return string(msg.Data)
}

func connectWS(server string, ctx context.Context) *websocket.Conn {
	conn, _, err := websocket.Dial(ctx, server, nil)
	if err != nil {
		log.Fatalln("cannot connect to websocket server:", err)
	}

	return conn
}

func buildWsRecvChan(conn *websocket.Conn, ctx context.Context) <-chan wsMessage {
	c := make(chan wsMessage)

	go (func() {
		for {
			msgType, data, err := conn.Read(ctx)
			if err != nil {
				continue;
			}

			c <- wsMessage {
				MessageType: msgType,
				Data: data,
			}
		}
	})()

	return c
}

func handleWSMessage(msg wsMessage, command string) {
	if msg.MessageType != websocket.MessageText {
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
