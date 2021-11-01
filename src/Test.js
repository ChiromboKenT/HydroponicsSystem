pHValues  = [110, 109,110,110,110,109,110,208,208,208,206,208,407,407,408,409,408,408,408,598,598,598,790,791,791,791,999,999,998,999] 
waterLevel = [0, 1, 5, 7,10,11,14,18,19,20,22,26,25,25,25,25,25,25,25,25,25,25,25,25,24,24,24,24,25]
luxValue = [110,109,110,208,208,208,206,208,407,407,408,409,408,408,408,598,598,598]
temp = [27,25,26,25,24,25,27,28,30,28,28,30]
hum = [30,25,32,33,34,35,37,38,50,58,58,60]

// pHValues.forEach(element => {
//     console.log(`TDS Sensor Reading: ${element}`)
// });

luxValue.forEach(element,indx => {
    
    console.log(`Current Avg Temperature: ${element}°C    Current Avg Humidity: ${hum[indx]}%`)
    if(element < 1 && hum[indx] < 70){
        console.log(`Cooling Fans: ON`)
    }else{
        console.log("Cooling Fans: OFF")
    }
})