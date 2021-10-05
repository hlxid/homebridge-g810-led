package main

import (
	"log"

	"github.com/godbus/dbus/v5"
)

func connectToDbus(command string) *dbus.Conn {
	conn, err := dbus.ConnectSessionBus()
	if err != nil {
		log.Fatalln("Failed to connect to session dbus:", err)
	}
	log.Println("Successfully connected to dbus.")

	rules := []string{
		"type='signal',interface='org.gnome.SessionManager.Presence'",
	}
	var flag uint = 0
	monitorCall := conn.BusObject().Call("org.freedesktop.DBus.Monitoring.BecomeMonitor", 0, rules, flag)
	if monitorCall.Err != nil {
		log.Fatalln("Failed to monitor:", monitorCall.Err)
	}

	c := make(chan *dbus.Message, 10)
	conn.Eavesdrop(c)
	readDbusMessages(c, command)

	return conn
}

func readDbusMessages(c chan *dbus.Message, command string) {
	go (func() {
		defer log.Println("Stopped dbus reader.")

		for msg := range c {
			log.Println("Received dbus message:", msg.String())
			handleDbusMessage(msg, command)
		}
	})()
}

func handleDbusMessage(msg *dbus.Message, command string) {
	// Get member and ignore if not existant
	v, ok := msg.Headers[dbus.FieldMember]
	if !ok {
		return
	}
	member := v.Value().(string)

	// Check member and that the message contains a body
	if member != "StatusChanged" || len(msg.Body) == 0 {
		return
	}

	presenceStatus, ok := msg.Body[0].(uint32)
	if !ok {
		return
	}

	// presenceStatus 3 is "Idle" aka. locked or sitting unused for extended periods of time
	// https://people.gnome.org/~mccann/gnome-session/docs/gnome-session.html#id349443
	isLocked := presenceStatus == 3
	log.Println("isLocked:", isLocked)

	var err error
	if isLocked {
		err = turnOff(command)
	} else {
		err = turnOn(command)
	}

	if err != nil {
		log.Fatalln("Could not update keyboard status:", err)
	}
}
