pHValues  = [110, 109,110,110,110,109,110,208,208,208,206,208,407,407,408,409,408,408,408,598,598,598,790,791,791,791,999,999,998,999] 
waterLevel = [0, 1, 5, 7,10,11,14,18,19,20,22,26,25,25,25,25,25,25,25,25,25,25,25,25,24,24,24,24,25]

// pHValues.forEach(element => {
//     console.log(`TDS Sensor Reading: ${element}`)
// });

waterLevel.forEach(element => {
    
    console.log(`Current Water Level: ${element}mm`)
    if(element < 25){
        console.log(`Water Pump: ON`)
    }else{
        console.log("Water Pump: OFF")
    }
})