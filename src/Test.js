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

const inletPump  = new Gpio(16, 'out');
const outletPump = new Gpio(20, 'out');
const valve = new Gpio(21, 'out');

inletPump.writeSync(0);
outletPump.writeSync(0)

 const close =  () => {
    try{
		
		
       	console.log("Exit");

      }
      catch(err){
        console.log(err);
      }
 }
process.on("SIGINT", close);
