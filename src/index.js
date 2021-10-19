const dataPin = 5;
const mcpadc = require("mcp-spi-adc")
const dhtSensor =  require('node-dht-sensor')
const raspi = require('raspi');
const pwm = require('raspi-soft-pwm');
let Cycle = 10; 

raspi.init(() => {
	const fan = new pwm.SoftPWM({pin:'GPIO17',frequency:30});
	fan.write(Cycle/100); // 50% Duty Cycle, aka half brightness
  });


let dutyInterval = setInterval(() => {
	raspi.init(() => {
		const fan = new pwm.SoftPWM({pin:'GPIO17',frequency:30});
		fan.write(Cycle/100); // 50% Duty Cycle, aka half brightness
	  });
	  
	if((Cycle + 10) > 100){
		Cycle = 10;
	}else{
		Cycle += 10;
	}
}, 2500);
//DefineIntervals
let WLInterval;
let DHTInterval;
let TDSInterval;

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

DHTInterval = setInterval(() => { 
	dhtSensor.read(11,4, (err,temperature,humidity) => {
	try{
		console.log(`temp: ${temperature}°C, humidity: ${humidity}%`);
	}catch(err){
		console.log(err);
	}
})
}, 2500); // the sensor can only be red every 2 seconds
 

 const close =  () => {
    try{
       
		raspi.init(() => {
			const fan = new pwm.SoftPWM({pin:'GPIO17',frequency:30});
			fan.write(0); // 50% Duty Cycle, aka half brightness
		  });
		clearInterval(DHTInterval);
		clearInterval(TDSInterval);
		clearInterval(WLInterval);
		clearInterval(dutyInterval);
       	console.log("Exit");

      }
      catch(err){
        console.log(err);
      }
 }
process.on("SIGINT", close);
