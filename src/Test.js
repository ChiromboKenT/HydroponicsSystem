pHValues  = [110, 109,110,110,110,109,110,208,208,208,206,208,407,407,408,409,408,408,408,598,598,598,790,791,791,791,999,999,998,999] 
waterLevel = [0, 1, 5, 7,10,11,14,18,19,20,22,26,25,25,25,25,25,25,25,25,25,25,25,25,24,24,24,24,25]
luxValue = [110,109,110,208,208,208,206,208,407,407,408,409,408,408,408,598,598,598]

// pHValues.forEach(element => {
//     console.log(`TDS Sensor Reading: ${element}`)
// });

luxValue.forEach(element => {
    
    console.log(`Current Illuminance: ${element}LUX`)
    if(element < 1){
        console.log(`Grow Lights: ON`)
    }else{
        console.log("Grow Lights: OFF")
    }
})