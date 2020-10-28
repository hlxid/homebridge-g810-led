import WebSocket = require('ws');
import { RGBData } from '../dto';
import { exec } from 'child_process';
import commandLineArgs from 'command-line-args';

const argOptions = [
  { name: 'command', alias: 'c', type: String },
  { name: 'server', alias: 's', type: String },
];
const args = commandLineArgs(argOptions) as { command: string; server: string };

argOptions.forEach(opt => {
  if(!args[opt.name]) {
    console.error(`--${opt.name}${opt.alias ? `/-${opt.alias}` : ''} command line argument not set!`);
    process.exit(1);
  }
});

exec(args.command + ' --help', (err) => {
  if(err) {
    // Strips away first line, which contains the command to be executed.
    const errorMessage = err.message.split('\n').slice(1).join('\n');
    console.error('Provided keyboard control command is invalid: ' + errorMessage);
    process.exit(1);
  }
});

const ws = new WebSocket(args.server);

function num2Hex(n: number): string {
  const hex = n.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function rgb2Hex(rgb: RGBData): string {
  return num2Hex(rgb.r) + num2Hex(rgb.g) + num2Hex(rgb.b);
}

ws.on('open', () => {
  console.log('Connected!');
});

ws.on('error', (err) => {
  console.log(`Couldn't connect to server: ${err.message}`);
});

ws.on('close', () => console.log('close'));

ws.on('message', (data) => {
  console.log(data.toString());
  const rgb: RGBData = JSON.parse(data.toString());
  const hex = rgb2Hex(rgb);
  
  exec(`${args.command} -a ${hex}`, (err) => {
    if (err) {
      console.log(err.message);
    }
  });
});