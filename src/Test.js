const dataPin = 5;
const mcpadc = require("mcp-spi-adc")
const Gpio = require('onoff').Gpio;
const dhtSensor =  require('node-dht-sensor').promises
const mqtt = require("mqtt");
const process  = require('process');

const raspi = require('raspi');
const pwm = require('raspi-soft-pwm');
const EventEmitter = require("events");

let controlState = 0
const options = {
	clientId : "mqqtRaspi1k",
}
 const opitons2 = {
	qos:1,
	retain:true
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
let UCInterval;

const inletPump  = new Gpio(26, 'out'); //Channel 1
const outletPump = new Gpio(20, 'out');	//Channel 2
const valve = new Gpio(21, 'out');		//Channel 3

//Define GPIO Pins
let Cycle = 100;
let fan;
const tempPin = 4;
const WaterLevelChannel = 7
const TDSChannel = 6;
const phChannel = 5
const relayOFF = 1;
const relayON = 0;

//Define Pump State
const flowState = {
	inlet : 1,
	outlet : 0,
	valve : 0
}	
let ControlState = 0;
inletPump.writeSync(relayOFF);
outletPump.writeSync(relayOFF);
valve.writeSync(relayOFF);


raspi.init(() => {
	fan = new pwm.SoftPWM({pin:'GPIO17',frequency:120});
	// 50% Duty Cycle, aka half brightness
	fan.write(0);
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

client.on("connect",() => {
	console.log("Connected");
	client.subscribe(["raspi-ken/lights", "raspi-ken/fan"], () => {
		console.log("Subscribed to topicPH");
	})
	client.publish(topicPH, "6.4" , {qos:1,retain:true}, (error) => {
		if(error){
			console.log(error);
		}
	})
	
	


	//Define events
	dht11Emmitter = new EventEmitter()
	dht11Emmitter.on("Read", (Value) => {
		if((Value.Temperature >= 23)){
			if(controlState == 0){
				fan.write(Cycle/100);
			}
			client.publish(topicFan, "true", {qos:1,retain:true}, (error) => {
				if(error){
					console.log(error);
				}
			})
			console.log("Fan Turned ON");
		} else{
			if(controlState == 0){
				fan.write(0);
			}
			
			client.publish(topicFan, "false", {qos:1,retain:true}, (error) => {
				if(error){
					console.log(error);
				}
			})
			console.log("Fan Turned OFF");
		}
	});  

	const WaterLevelMeter = mcpadc.open(WaterLevelChannel, {speedHz: 20000}, err => {
		if (err) throw err;
		WLInterval = setInterval(_ => {
			WaterLevelMeter.read((err, reading) => {
			if (err) throw err;
			const waterLevel = (reading.value * 3.3 - 0.5) * 100
			if(controlState == 0){
				if( waterLevel >= 150){
					
					console.log("Inlet Pump On");
					swithInletPump(relayON) //Water In
					client.publish(topicInlet, "true", {qos:1,retain:true}, (error) => {
						if(error){
							console.log(error);
						}
					})
				}else{
					
					console.log("Inlet Pump OFF");
					swithInletPump(relayOFF);
					client.publish(topicInlet, "false", {qos:1,retain:true}, (error) => {
					if(error){
						console.log(error);
					}
				})
				}
			}
			console.log(`Water Level: ${waterLevel}`);
			const waterValue = waterLevel <= 150 ? 100 : 280 - waterLevel;
			client.publish(topicWater, `${waterValue > 0 ? waterValue : waterValue * -1}`, {qos:1,retain:true}, (error) => {
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
			client.publish(topicHumidity, `${Data.Humidity}`, {qos:1,retain:true}, (error) => {
				if(error){
					console.log(error);
				}
			})
			client.publish(topicTemp, `${Data.Temperature}`, {qos:1,retain:true}, (error) => {
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
			client.publish(topicTDS, `${tdsVal}`, {qos:1,retain:true}, (error) => {
				if(error){
					console.log(error);
				}
			})
			if(tdsVal <= 120){
				console.log("OUTLET VALVE ON")
				swithOutletValve(relayON);
				console.log("OUTLET Pump ON");
				swithOutletPump(relayON);
				client.publish(topicOutlet, "true", {qos:1,retain:true}, (error) => {
				if(error){
					console.log(error);
				}
				})
			}else{
				console.log("OUTLET VALVE OFF ")
				swithOutletValve(relayOFF);
				console.log("OUTLET Pump OFF");
				swithOutletPump(relayOFF);
				client.publish(topicOutlet, "false", {qos:1,retain:true}, (error) => {
				if(error){
					console.log(error);
				}
				})
			}
		
			
		});
		}, 2000);
	});	
});

client.on("message", (topic,payload) => {
	console.log(`Message Received: ${topic}: ${payload}`);

	if(topic == "raspi-ken/inlet"){
		swithInletPump(payload)
	}
	controlState = 1;
	UCInterval = setTimeout(() => {
		controlState = 0;
	},10000)
});
const close =  () => {
    try{
		
		inletPump.writeSync(relayOFF);
		outletPump.writeSync(relayOFF);
		valve.writeSync(relayOFF);
        clearInterval(WLInterval)
		clearInterval(DHTInterval);
		clearTimeout(UCInterval);
       	console.log("Exit");

      }
      catch(err){
        console.log(err);
      }
	}

 process.on('beforeExit', (code) => {
	console.log('Process beforeExit event with code: ', code);

  });

process.stdin.resume();
process.on("SIGINT", close);
