const dataPin = 5;
const mcpadc = require("mcp-spi-adc")
const Gpio = require('onoff').Gpio;


const raspi = require('raspi');
const pwm = require('raspi-soft-pwm');
const events = require("events");
const {TempSensor} = require("./TempSensor.js")

//Define Pump State
 const flowState = {
	 inlet : 0,
	 outlet : 0,
	 valve : 0
 }	

const NutrientTrigger = 0;

//Define GPIO Pins
let Cycle = 100;
let fan;
const tempPin = 4;
const WaterLevelChannel = 7
const TDSChannel = 6;
const phChannel = 5
const inletPump  = new Gpio(26, 'out'); //Channel 1
const outletPump = new Gpio(20, 'out');	//Channel 2
const valve = new Gpio(21, 'out');		//Channel 3

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



inletPump.writeSync(flowState.inlet);
outletPump.writeSync(flowState.outlet);
valve.writeSync(flowState.valve);
//DefineIntervals
let WLInterval;
let DHTInterval;
let TDSInterval;
let PhInterval;

DHTInterval = setInterval(async () => { 
	try{
		const {Temperature,Humidity} = await dht11.Read();
		console.log(`Outside Temp: ${Temperature} ---- Outside Humidity: ${Humidity}`)
	}
	catch(err){
		console.log(err)
	}

}, 3000); // the sensor can only be red every 2 seconds
 
const WaterLevelMeter = mcpadc.open(WaterLevelChannel, {speedHz: 20000}, err => {
	if (err) throw err;
	WLInterval = setInterval(_ => {
		WaterLevelMeter.read((err, reading) => {
		if (err) throw err;
		const waterLevel = (reading.value * 3.3 - 0.5) * 100
		if( waterLevel <= 200){
			swithInletPump(1) //Water In
		}else{
			swithInletPump(0);
		}
		console.log(`Water Level: ${waterLevel}`);
	  });
	}, 1000);
  });

  const TDSReading = mcpadc.open(TDSChannel, {speedHz: 20000}, err => {
	if (err) throw err;
	TDSInterval = setInterval(_ => {
		TDSReading.read((err, reading) => {
		if (err) throw err;
		const tdsVal = (reading.value * 3.3 - 0.5) * 100 + 50;
		if(tdsVal > 500){
			swithOutletValve(1)//Open Valve
			swithOutletPump(1);
		}else{
			swithOutletValve(0)
			swithOutletPump(0);
		}
		console.log(`TDS Level: ${tdsVal}`);
	  });
	}, 1000);
  });

  const pHReading = mcpadc.open(phChannel, {speedHz: 20000}, err => {
	if (err) throw err;
	PhInterval = setInterval(_ => {
		pHReading.read((err, reading) => {
		if (err) throw err;
			
		console.log(`PH Reading: ${(reading.value * 3.3 - 0.5) * 100}`);
	  });
	}, 1000);
  });
  

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
const switchOff = () => {
	swithInletPump(0);
	swithOutletValve(0);
	swithOutletPump(0);
}

 const close =  () => {
    try{
		
		inletPump.unexport();
		outletPump.unexport();
		valve.unexport();
		fan.write(0); //sWITCH OFF FAN
		clearInterval(DHTInterval);
		clearInterval(TDSInterval);
		clearInterval(WLInterval);
		clearInterval(PhInterval);
       	console.log("Exit");

      }
      catch(err){
        console.log(err);
      }
 }
process.on("SIGINT", close);
