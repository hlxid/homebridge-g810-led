# homebridge-g810-led

This homebridge plugin allows controlling the lighting of Logitech keyboards under linux using [g810-led](https://github.com/MatMoul/g810-led).

## Installing and homebridge plugin

The homebridge plugin will create a websocket server which provides the values that the homebridge receivies using homekit.

Install the plugin using npm:

```shell
$ sudo npm install -g homebridge-logitech-keyboard
```

After that restart your homebridge and create a new accessory. Here's a example config:

```json
{
    "accessory": "G810-led",
    "name": "My Keyboard",
    "port": 50000,
    "rgb": false
}
```

You can change `name` to distinglish your keyboard.

The `port` parameter is setting the port of the websocket server that will run on the homebridge. You can change it if you want to connect more than one keyboard.

You should set `rgb` to `true` if your keyboard supports RGB. If it is set to `false` you only have controll over the brightness and it will always show white, this should be used if your keyboard has only white leds.

## Installing the client on your linux machine

This client will connect to the websocket server of this plugin, get the color and use `g810-led` to update the lighting of your keyboard. You need to have [g810-led](https://github.com/MatMoul/g810-led/blob/master/INSTALL.md) installed.

Install the `homebridge-logitech-keyboard` package:

```shell
$ sudo npm install -g homebridge-logitech-keyboard
```

Temporarily start the client using this command:

```shell
$ homebridge-logitech-keyboard-client -c g810-led -s ws://<homebridge-ip>:<port>
```

You may want to change the `-c` (command) parameter to use the correct command for your keyboard. Refer to [this](https://github.com/MatMoul/g810-led#help-) page to see all available commands.

The `-s` (server) parameter sets the server. Change the ip and port accordingly.

After you executed the command you can test whether everything works.

As a permanent install I recommend creating a systemd service unit to start the client if you start your computer.

To use a systemd service create a file at `/etc/systemd/system/homebridge-g810.service` with the following contents:
```
[Unit]
Description=Homebridge g810-led client
After=network-online.target

[Service]
Type=simple
ExecStart=/bin/sh -c 'homebridge-g810-led-client -c g810-led -s ws://<homebridge-ip>:<port>'

[Install]
WantedBy=multi-user.target
```

Then reload systemd and enable the service:

```shell
$ sudo systemctl daemon-reload
$ sudo systemctl enable homebridge-g810.service
$ sudo systemctl start homebridge-g810.service
```
