const dataPin = 5;
const mcpadc = require("mcp-spi-adc")
const Gpio = require('onoff').Gpio;


const raspi = require('raspi');
const pwm = require('raspi-soft-pwm');
const events = require("events");
const {TempSensor} = require("./TempSensor.js")
const AnalogSensor = require("./AnalogSensors")

//Define GPIO Pins
let Cycle = 100;
let fan;
const tempPin = 4;
const WaterLevelChannel = 7
const TDSChannel = 6;

//Define TempSensor
const dht11 = new TempSensor(tempPin,11)

//Define WaterLevelSensor
const waterLevel = new AnalogSensor(WaterLevelChannel);
//Define TDSSensor 
const TDSsensor = new AnalogSensor(TDSChannel)

raspi.init(() => {
	fan = new pwm.SoftPWM({pin:'GPIO17',frequency:120});
	 // 50% Duty Cycle, aka half brightness
  });

  

//Define events
dht11.eventEmmiter.on("Fan ON", () => {
	fan.write(Cycle/100);
})
dht11.eventEmmiter.on("Fan OFF", () => {
	fan.write(0);
})



//DefineIntervals
let WLInterval;
let DHTInterval;
let TDSInterval;

DHTInterval = setInterval(async () => { 
	try{
		const {Temperature,Humidity} = await dht11.Read();
		console.log(`Outside Temp: ${Temperature} ---- Outside Humidity: ${Humidity}`)
	}
	catch(err){
		console.log(err)
	}

}, 2000); // the sensor can only be red every 2 seconds
 
WLInterval = setInterval(async () => {
	try{
		const WaterLevel = await waterLevel.GetReading()
		console.log(`Water Level@  ${WaterLevel}`)
	}catch(err){
		console.log(err)
	}
}, 2000);


TDSInterval = setInterval (async() => {
	try{
		const TDSReading = await TDSsensor.GetReading()
		console.log(`TDS@  ${TDSReading + 50}`)
	}catch(err){
		console.log(err)
	}
},2000)



 const close =  () => {
    try{
       
		fan.write(0); //sWITCH OFF FAN
		clearInterval(DHTInterval);
		clearInterval(TDSInterval);
		clearInterval(WLInterval);
       	console.log("Exit");

      }
      catch(err){
        console.log(err);
      }
 }
process.on("SIGINT", close);
