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
const WaterLevelChannel = 7
const TDSChannel = 6;
const phChannel = 5

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
let PhInterval;

//Define Pump State
 const flowState = {
	 inlet : 1,
	 outlet : 0,
	 valve : 0
 }	


const inletPump  = new Gpio(26, 'out'); //Channel 1
const outletPump = new Gpio(20, 'out');	//Channel 2
const valve = new Gpio(21, 'out');		//Channel 3


inletPump.writeSync(0);
outletPump.writeSync(0);



 const WaterLevelMeter = mcpadc.open(WaterLevelChannel, {speedHz: 20000}, err => {
	if (err) throw err;
	WLInterval = setInterval(_ => {
		WaterLevelMeter.read((err, reading) => {
		if (err) throw err;
		const waterLevel = (reading.value * 3.3 - 0.5) * 100
		if( waterLevel <= 200){
            console.log("Inlet Pump On");
			swithInletPump(1) //Water In
		}else{
            
            console.log("Inlet Pump OFF");
			swithInletPump(0);
		}
		console.log(`Water Level: ${waterLevel}`);
	  });
	}, 1000);
  });


//Temp Sensor
DHTInterval = setInterval(async () => { 
	try{
		const {Temperature,Humidity} = await dht11.Read();
		console.log(`Outside Temp: ${Temperature} ---- Outside Humidity: ${Humidity}`)
	}
	catch(err){
		console.log(err)
	}

}, 2000); // the sensor can only be red every 2 seconds

const swithInletPump = (state) => {
	inletPump.writeSync(state);
	flowState.inlet = state
}
const swithOutletPump = (state) => {
	outletPump.writeSync(state);
	flowState.outlet = state
}
const swithOutletValve = (state) => {
	valve.writeSync(state);	
	flowState.valve = state
}

const close =  () => {
    try{
		
        clearInterval(WLInterval)
		clearInterval(DHTInterval);
       	console.log("Exit");

      }
      catch(err){
        console.log(err);
      }
 }
process.on("SIGINT", close);
