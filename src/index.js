const dataPin = 5;
const dht =  require('pigpio-dht')
const sensor = dht(dataPin, 11);


setInterval(() => { 
    sensor.read();
}, 2500); // the sensor can only be red every 2 seconds
 
sensor.on('result', data => {
    console.log(`temp: ${data.temperature}°c`); 
    console.log(`rhum: ${data.humidity}%`); 
});
 
sensor.on('badChecksum', () => {
    console.log('checksum failed');
});

 const close =  () => {
    try{
       
       console.log("Exit");
      }
      catch(err){
          console.log(err);
      }
 }
process.on("SIGINT", close);
