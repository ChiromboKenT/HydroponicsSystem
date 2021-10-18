const dataPin = 5;
const dhtSensor =  require('node-dht-sensor')


setInterval(() => { 
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
       
       console.log("Exit");
      }
      catch(err){
          console.log(err);
      }
 }
process.on("SIGINT", close);
