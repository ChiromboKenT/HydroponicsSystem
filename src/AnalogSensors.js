const mcpadc = require("mcp-spi-adc")

class AnalogSensor {
    constructor(Channel){
        this.Channel =  Channel
        this.sensor  =  mcpadc.open(this.Channel, {speedHz: 20000},this.GetReading)
    }
    GetReading(){
        return new Promise((resolve, reject) => {
            try{
                sensor.read((err, reading) => {
                    if (err) throw err;
                    console.log(`ANALOG PRINT: ${reading}`)
                    resolve((reading.value * 3.3 - 0.5) * 100)
                })
            }catch(err){
                reject(`Analog Sensor Error: ${err}`)
            }
        })
    }
}

module.exports = AnalogSensor