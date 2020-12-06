# homebridge-g810-ed

This homebridge plugin allows controlling the lighting of Logitech keyboards under linux using [g810-led](https://github.com/MatMoul/g810-led).

## Installing and homebridge plugin

The homebridge plugin will create a websocket server which provides the values that the homebridge receivies using homekit.

Install the plugin using npm:

```shell
$ sudo npm install -g homebridge-g810-led
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

Install the `homebridge-g810-led` package:

```shell
$ sudo npm install -g homebridge-g810-led
```

Temporarily start the client using this command:

```shell
$ homebridge-g810-led-client -c g810-led -s ws://<homebridge-ip>:<port>
```

You may want to change the `-c` (command) parameter to use the correct command for your keyboard. Refer to [this](https://github.com/MatMoul/g810-led#help-) page to see all available commands.

The `-s` (server) parameter sets the server. Change the ip and port accordingly.

After you executed the command you can test whether everything works.

As a permanent install I recommend [pm2](https://pm2.keymetrics.io/) to start the client if you start your computer. You may also use a systemd service or other way to start the client.

To use pm2 first install it, start the client using following commands and save the process:

```shell
$ sudo npm install -g pm2
$ pm2 start homebridge-g810-led-client -- -c g810-led -s ws://<homebridge-ip>:<port>
$ pm2 save
```

Then setup pm2 to start at startup:

```shell
$ pm2 startup
```

Note that it says how you can set it up and you might still need to execute a command that it prints.