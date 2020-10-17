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

class G810LedLightBulb implements AccessoryPlugin {

  private readonly log: Logging;
  private readonly name: string;
  private bulbOn = false;
  private brightness = 0;
  private saturation = 0;
  private hue = 0;

  private readonly bulbService: Service;
  private readonly informationService: Service;

  constructor(log: Logging, config: AccessoryConfig, _api: API) {
    this.log = log;
    this.name = config.name;

    this.bulbService = new hap.Service.Lightbulb(this.name);
    this.bulbService.getCharacteristic(hap.Characteristic.On)
      .on('get', (callback: CharacteristicGetCallback) => {
        callback(undefined, this.bulbOn);
      })
      .on('set', (value, callback: CharacteristicSetCallback) => {
        this.bulbOn = value;
        log.info('G810Led was set to: ' + (this.bulbOn ? 'ON' : 'OFF'));
        callback();
      });

    this.bulbService.getCharacteristic(hap.Characteristic.Brightness)
      .on('get', (callback: CharacteristicGetCallback) => {
        callback(undefined, this.brightness);
      })
      .on('set', (value, callback: CharacteristicSetCallback) => {
        this.brightness = value;
        log.info('G810Led brightness was set to: ' + this.brightness);
        callback();
      });

    this.bulbService.getCharacteristic(hap.Characteristic.Saturation)
      .on('get', (callback: CharacteristicGetCallback) => {
        callback(undefined, this.saturation);
      })
      .on('set', (value, callback: CharacteristicSetCallback) => {
        this.saturation = value;
        log.info('G810Led saturation was set to: ' + value);
        callback();
      });

    this.bulbService.getCharacteristic(hap.Characteristic.Hue)
      .on('get', (callback: CharacteristicGetCallback) => {
        callback(undefined, this.hue);
      })
      .on('set', (value, callback: CharacteristicSetCallback) => {
        this.hue = value;
        log.info('G810Led hue was set to: ' + value);
        callback();
      });


    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'Soßen Hersteller')
      .setCharacteristic(hap.Characteristic.Model, 'Soos 3000');

    log.info('G810-led finished initializing!');
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    // TODO: implement pulsing
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