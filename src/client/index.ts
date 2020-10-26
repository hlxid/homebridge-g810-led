import WebSocket = require('ws');
import { RGBData } from '../dto';
import { exec } from 'child_process';

const ws = new WebSocket('ws://192.168.2.60:50000');

function num2Hex(n:number): string {
  const hex = n.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function rgb2Hex(rgb: RGBData): string {
  return `${num2Hex(rgb.r)}${num2Hex(rgb.g)}${num2Hex(rgb.b)}`;
}

ws.on('open', () => {
  console.log('Connected!');
});

ws.on('message', (data) => {
  console.log(data.toString());
  const rgb: RGBData = JSON.parse(data.toString());
  const hex = rgb2Hex(rgb);
  console.log(hex);
  exec(`g610-led -a ${hex}`, (err) => {
    if(err) {
      console.log(err.message);
    }
  });
});