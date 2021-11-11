const dataPin = 5;
const mcpadc = require("mcp-spi-adc")
const Gpio = require('onoff').Gpio;
const dhtSensor =  require('node-dht-sensor').promises
const mqtt = require("mqtt");
const process  = require('process');

const raspi = require('raspi');
const pwm = require('raspi-soft-pwm');
const EventEmitter = require("events");


const options = {
	clientId : "mqqtRaspi1k",
}
 const opitons2 = {
	qos:0,
	retain:false
}
let client = mqtt.connect("mqtt://test.mosquitto.org",options)

const topicPH = "raspi-ken/ph";
const topicTemp = "raspi-ken/temp";
const topicHumidity = "raspi-ken/humidity";
const topicTDS = "raspi-ken/tds";
const topicInlet = "raspi-ken/inlet";
const topicOutlet = "raspi-ken/outlet";
const topicFan = "raspi-ken/fan"

const topicWater = "raspi-ken/water"

//DefineIntervals
let WLInterval;
let DHTInterval;
let TDSInterval;
let PhInterval;


client.on("connect",() => {
	console.log("Connected");
	client.subscribe(["raspi-ken/lights"], () => {
		console.log("Subscribed to topicPH");
	})
	client.publish(topicPH, "6.4" , {qos:1,retain:true}, (error) => {
	if(error){
		console.log(error);
	}
	})
	
//Define GPIO Pins
let Cycle = 100;
let fan;
const tempPin = 4;
const WaterLevelChannel = 7
const TDSChannel = 6;
const phChannel = 5
const relayOFF = 1;
const relayON = 0;

//Define TempSensor

raspi.init(() => {
	fan = new pwm.SoftPWM({pin:'GPIO17',frequency:120});
	 // 50% Duty Cycle, aka half brightness
	fan.write(0);
  });


//Define events
dht11Emmitter = new EventEmitter()
dht11Emmitter.on("Read", (Value) => {
	if((Value.Temperature >= 23)){
		fan.write(Cycle/100);
		client.publish(topicFan, "true", {qos:0,retain:true}, (error) => {
			if(error){
				console.log(error);
			}
		})
		console.log("Fan Turned ON");
	} else{
		fan.write(0);
		client.publish(topicFan, "false", {qos:0,retain:true}, (error) => {
			if(error){
				console.log(error);
			}
		})
		console.log("Fan Turned OFF");
	}
})  



//Define Pump State
 const flowState = {
	 inlet : 1,
	 outlet : 0,
	 valve : 0
 }	


const inletPump  = new Gpio(26, 'out'); //Channel 1
const outletPump = new Gpio(20, 'out');	//Channel 2
const valve = new Gpio(21, 'out');		//Channel 3


inletPump.writeSync(relayOFF);
outletPump.writeSync(relayOFF);
valve.writeSync(relayOFF);


 const WaterLevelMeter = mcpadc.open(WaterLevelChannel, {speedHz: 20000}, err => {
	if (err) throw err;
	WLInterval = setInterval(_ => {
		WaterLevelMeter.read((err, reading) => {
		if (err) throw err;
		const waterLevel = (reading.value * 3.3 - 0.5) * 100
		if( waterLevel >= 150){
				
	            console.log("Inlet Pump On");
			swithInletPump(relayON) //Water In
			client.publish(topicInlet, "true", {qos:0,retain:true}, (error) => {
			if(error){
				console.log(error);
			}
			})
		}else{
            
            console.log("Inlet Pump OFF");
			swithInletPump(relayOFF);
			client.publish(topicInlet, "false", {qos:0,retain:false}, (error) => {
			if(error){
				console.log(error);
			}
		})
		}
		console.log(`Water Level: ${waterLevel}`);
		client.publish(topicWater, `${waterLevel}`, {qos:0,retain:false}, (error) => {
			if(error){
				console.log(error);
			}
		})
	  });
	}, 1000);
  });




DHTInterval = setInterval(async () => { 
	try{
		const res = await dhtSensor.read(11, tempPin);
		const Data = {
			Temperature: res.temperature.toFixed(1),
			Humidity : res.humidity.toFixed(1)
		}
		console.log(
			`temp: ${Data.Temperature}°C, ` +
			`humidity: ${Data.Humidity}%`
		);
		client.publish(topicHumidity, `${Data.Humidity}`, {qos:0,retain:false}, (error) => {
			if(error){
				console.log(error);
			}
		})
		client.publish(topicTemp, `${Data.Temperature}`, {qos:0,retain:false}, (error) => {
			if(error){
				console.log(error);
			}
		})
		dht11Emmitter.emit("Read",Data); 
	}
	catch(err){
		console.log(`Error with Reading Temp Value: ${err}`)
	}

}, 2000); // the sensor can only be red every 2 seconds

const TDSReading = mcpadc.open(TDSChannel, {speedHz: 20000}, err => {
	if (err) throw err;
	TDSInterval = setInterval(_ => {
		TDSReading.read((err, reading) => {
		if (err) throw err;
		const tdsVal = (reading.value * 3.3 - 0.5) * 100 + 50;
		console.log(`TDS Level: ${tdsVal}`);
		client.publish(topicTDS, `${tdsVal}`, {qos:0,retain:false}, (error) => {
			if(error){
				console.log(error);
			}
		})
		if(tdsVal <= 120){
			console.log("OUTLET VALVE ON")
			swithOutletValve(relayON);
			console.log("OUTLET Pump ON");
			swithOutletPump(relayON);
			client.publish(topicOutlet, "true", {qos:0,retain:false}, (error) => {
			if(error){
				console.log(error);
			}
			})
		}else{
			console.log("OUTLET VALVE OFF ")
			swithOutletValve(relayOFF);
			console.log("OUTLET Pump OFF");
			swithOutletPump(relayOFF);
			client.publish(topicOutlet, "false", {qos:0,retain:false}, (error) => {
			if(error){
				console.log(error);
			}
			})
		}
	
		
	  });
	}, 2000);
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

}
	
})

client.on("message", (topic,payload) => {
	console.log(`Message Received: ${topic}: ${payload}`);
})
const close =  () => {
    try{
		
		inletPump.writeSync(relayOFF);
		outletPump.writeSync(relayOFF);
		valve.writeSync(relayOFF);
        clearInterval(WLInterval)
		clearInterval(DHTInterval);
       	console.log("Exit");

      }
      catch(err){
        console.log(err);
      }
 

 process.on('beforeExit', (code) => {
	console.log('Process beforeExit event with code: ', code);

  });
process.stdin.resume();
process.on("SIGINT", close);
