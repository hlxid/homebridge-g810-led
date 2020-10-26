import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  HAP,
  Logging,
  Service,
} from 'homebridge';

import { ACCESSORY_NAME } from './settings';
import { Server } from 'ws';
import { G810LedConfig, LightState, RGBData } from './dto';
import * as convert from 'color-convert';

/*
 * IMPORTANT NOTICE
 *
 * One thing you need to take care of is, that you never ever ever import anything directly from the "homebridge" module 
 * (or the "hap-nodejs" module).
 * The above import block may seem like, that we do exactly that, but actually those imports are only used for types and interfaces
 * and will disappear once the code is compiled to Javascript.
 * In fact you can check that by running `npm run build` and opening the compiled Javascript file in the `dist` folder.
 * You will notice that the file does not contain a `... = require("homebridge");` statement anywhere in the code.
 *
 * The contents of the above import statement MUST ONLY be used for type annotation or accessing things like CONST ENUMS,
 * which is a special case as they get replaced by the actual value and do not remain as a reference in the compiled code.
 * Meaning normal enums are bad, const enums can be used.
 *
 * You MUST NOT import anything else which remains as a reference in the code, as this will result in
 * a `... = require("homebridge");` to be compiled into the final Javascript code.
 * This typically leads to unexpected behavior at runtime, as in many cases it won't be able to find the module
 * or will import another instance of homebridge causing collisions.
 *
 * To mitigate this the {@link API | Homebridge API} exposes the whole suite of HAP-NodeJS inside the `hap` property
 * of the api object, which can be acquired for example in the initializer function. This reference can be stored
 * like this for example and used to access all exported variables and classes from HAP-NodeJS.
 */
let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory(ACCESSORY_NAME, G810LedLightBulb);
};



function rgbFromLightState(state: LightState): RGBData {
  if (!state.enabled) {
    return { r: 0, g: 0, b: 0 };
  }

  const rgb = convert.hsv.rgb([state.hue, state.saturation, state.brightness]);
  return {
    r: rgb[0],
    g: rgb[1],
    b: rgb[2],
  };
}

class G810LedLightBulb implements AccessoryPlugin {

  private readonly config: G810LedConfig;
  private ws?: Server;

  private readonly state: LightState = {
    enabled: false, brightness: 0, saturation: 0, hue: 0,
  };

  private rgb: RGBData = rgbFromLightState(this.state);


  private readonly name: string;
  private readonly bulbService: Service;
  private readonly informationService: Service;

  constructor(private readonly log: Logging, config: AccessoryConfig, _api: API) {
    this.log = log;
    this.name = config.name;
    this.config = config as G810LedConfig;

    this.bulbService = new hap.Service.Lightbulb(this.name);
    this.bulbService.getCharacteristic(hap.Characteristic.On)
      .on('get', this.charGet('enabled'))
      .on('set', this.charSet('enabled'));

    this.bulbService.getCharacteristic(hap.Characteristic.Brightness)
      .on('get', this.charGet('brightness'))
      .on('set', this.charSet('brightness'));

    if (this.config.rgb) {
      this.bulbService.getCharacteristic(hap.Characteristic.Saturation)
        .on('get', this.charGet('saturation'))
        .on('set', this.charSet('saturation'));

      this.bulbService.getCharacteristic(hap.Characteristic.Hue)
        .on('get', this.charGet('hue'))
        .on('set', this.charSet('hue'));
    }

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'Logitech')
      .setCharacteristic(hap.Characteristic.Model, 'G810-led lib powered keyboard');

    const port = this.config.port ?? 13400;
    this.ws = new Server({ port }, () => {
      this.log(`WS server successfully started at port ${port}.`);
    });

    this.ws.on('connection', (sock) => {
      this.log(`A new client connected: ${sock.url}`);
      sock.send(JSON.stringify(this.rgb));
    });

    log.info('G810-led finished initializing!');
  }

  private charGet(name: keyof LightState) {
    return (cb: CharacteristicGetCallback) => {
      cb(undefined, this.state[name]);
    };
  }

  private charSet<K extends keyof LightState>(name: K) {
    return ((value: LightState[K], cb: CharacteristicSetCallback) => {
      this.state[name] = value;
      this.log.info(`${name} was set to "${this.state[name]}"`);
      this.rgb = rgbFromLightState(this.state);
      this.ws?.clients.forEach(client => {
        client.send(JSON.stringify(this.rgb));
      });
      cb();
    }) as (value: unknown, cb: CharacteristicSetCallback) => void;
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    // TODO: implement pulsing
    this.log('Identify!');
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.informationService,
      this.bulbService,
    ];
  }
}