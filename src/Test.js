pHValues  = [110, 109,110,110,110,109,110,208,208,208,206,208,407,407,408,409,408,408,408,598,598,598,790,791,791,791,999,999,998,999] 
waterLevel = [0, 1, 5, 7,10,11,14,18,19,20,22,26,25,25,25,25,25,25,25,25,25,25,25,25,24,24,24,24,25]
luxValue = [110,109,110,208,208,208,206,208,407,407,408,409,408,408,408,598,598,598]
temp = [21,22,23,25,26,27,27,28,24,22,28,30]
hum = [80,78,74,73,74,70,67,68,60,58,58,60]

// pHValues.forEach(element => {
//     console.log(`TDS Sensor Reading: ${element}`)
// });

temp.forEach((element,indx) => {
    
    console.log(`Current Avg Temperature: ${element}°C    Current Avg Humidity: ${hum[indx]}%`)
    if(element < 25){
        console.log("Cooling Fans: OFF")
    }
    else if(element >= 25 && hum[indx] < 70){
        console.log(`Cooling Fans: ON`)
    }else{
        console.log("Cooling Fans: OFF")
    }
})