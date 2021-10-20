const mcpadc = require("mcp-spi-adc")

class AnalogSensor {
    constructor(Channel){
        this.ASensor = mcpadc.open(Channel, {speedHz: 20000},GetReading)
    }
    GetReading(){
        return new Promise((resolve, reject) => {
            try{
                this.ASensor.read((err, reading) => {
                    if (err) throw err;
                    console.log(`ANALOG PRINT: ${reading.JSON()}`)
                    resolve((reading.value * 3.3 - 0.5) * 100)
                })
            }catch(err){
                reject(`Analog Sensor Error: ${err}`)
            }
        })
    }
}

module.exports = AnalogSensor