const EventEmitter = require('events')
const dhtSensor =  require('node-dht-sensor')

class TempSensor {
    constructor(GPIOPin,SensorType){
        this.SensorPin = GPIOPin;
        this.SensorType = SensorType; 
        this.eventEmmiter = new EventEmitter()
        this.eventEmmiter.on("Read", (Value) => {
            if((Value.Temperature >= 23)){
                this.eventEmmiter.emit('Fan ON');
                console.log("Fan Turned ON");
            } else{
                this.eventEmmiter.emit('Fan OFF');
                console.log("Fan Turned OFF");
            }
        })       
    }

    
    Read(){
        const ReadingValue = new Promise((resolve,reject) => {
            try{
                dhtSensor.read(this.SensorType,this.SensorPin, (err,temperature,humidity) => {
                    if(err) throw `Sensor Error -> ${err}`
                    const Data = {
                        Temperature: temperature,
                        Humidity : humidity
                    }
                    this.eventEmmiter.emit("Read",Data); 
                    resolve(Data);
                })
            }catch(err){
                reject(`Error with Reading Value: ${err}`)
            }
        }) 
        return ReadingValue;
    }



    
}

exports.TempSensor = TempSensor