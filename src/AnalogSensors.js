const mcpadc = require("mcp-spi-adc")

class AnalogSensor {
    constructor(Channel){
        this.Channel =  Channel
    }
    GetReading(){
        return new Promise((resolve, reject) => {
            try{
                const sensor =  mcpadc.open(this.Channel, {speedHz: 20000},() =>{
                    sensor.read((err, reading) => {
                        if (err) throw err;
                        console.log(`ANALOG PRINT: ${reading}`)
                        resolve((reading.value * 3.3 - 0.5) * 100)
                    })
                })
            }catch(err){
                reject(`Analog Sensor Error: ${err}`)
            }
        })
    }
}

module.exports = AnalogSensor