import {AccessoryConfig} from 'homebridge';

export interface LightState {
    enabled: boolean;
    brightness: number;
    saturation: number;
    hue: number;
}

export interface G810LedConfig extends AccessoryConfig {
    port?: number;
    rgb?: boolean;
}

export interface RGBData {
    r: number;
    g: number;
    b: number;
}
