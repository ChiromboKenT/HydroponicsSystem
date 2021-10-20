const dataPin = 5;
const mcpadc = require("mcp-spi-adc")
const Gpio = require('onoff').Gpio;

const raspi = require('raspi');
const pwm = require('raspi-soft-pwm');
const events = require("events");
const {TempSensor} = require("./TempSensor.js")


//Define GPIO Pins
let Cycle = 100;
let fan;
const tempPin = 4;

//Define TempSensor
const dht11 = new TempSensor(tempPin,11)

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

}, 1500); // the sensor can only be red every 2 seconds
 
const WaterLevelMeter = mcpadc.open(7, {speedHz: 20000}, err => {
	if (err) throw err;
	WLInterval = setInterval(_ => {
		WaterLevelMeter.read((err, reading) => {
		if (err) throw err;
			
		console.log(`Water Level: ${(reading.value * 3.3 - 0.5) * 100}`);
	  });
	}, 1000);
  });

const TDSReading = mcpadc.open(6, {speedHz: 20000}, err => {
	if (err) throw err;
	TDSInterval = setInterval(_ => {
		TDSReading.read((err, reading) => {
		if (err) throw err;

		console.log(`TDS: ${(reading.value * 3.3 - 0.5) * 100 + 50}`);
		});
	}, 1000);
});



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
