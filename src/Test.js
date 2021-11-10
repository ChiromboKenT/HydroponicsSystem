const dataPin = 5;
const mcpadc = require("mcp-spi-adc")
const Gpio = require('onoff').Gpio;


const raspi = require('raspi');
const pwm = require('raspi-soft-pwm');
const events = require("events");
const {TempSensor} = require("./TempSensor.js")

//Define Pump State
 const flowState = {
	 inlet : 1,
	 outlet : 0,
	 valve : 0
 }	


//Define GPIO Pins

const inletPump  = new Gpio(26, 'out');
const outletPump = new Gpio(20, 'out');
const valve = new Gpio(21, 'out');

inletPump.writeSync(0);
outletPump.writeSync(0)
let count = 0;

const countInterval = setInterval(() => {
    count ++;
    if(count % 3 == 0){
        console.log(count)
        inletPump.writeSync(1);
    }
}, 1500)
 const close =  () => {
    try{
		
		clearInterval(countInterval);
       	console.log("Exit");

      }
      catch(err){
        console.log(err);
      }
 }

while(1){
    
}
process.on("SIGINT", close);
