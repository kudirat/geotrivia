//eltons
let eltonsLat = 40.69272122881661;
let eltonsLong = -73.98702333530535;

function openServices() {
    if ( 'geolocation' in navigator) {
        console.log(navigator);
        console.log ( 'geolocation available');
        //console.log(navigator.geolocation.getCurrentPosition);
        //navigator geolocation getcurrentposition takes a callback function as an argument (provides coords when they are available )
        navigator.geolocation.getCurrentPosition(function(e) {
            console.log("location:", e.coords.latitude, e.coords.longitude);
            if (Math.abs(e.coords.latitude - eltonsLat) < 0.1008 && Math.abs(e.coords.longitude - eltonsLong) < 0.1008) {
                myLocation.innerHTML = "you're steaming hot"
                
            }
            else {
                myLocation.innerHTML = "you're cold"
                myLocation.innerHTML += ", you are this many feet away: " + (Math.abs(e.coords.latitude - eltonsLat) + Math.abs(e.coords.longitude - eltonsLong) * 364000)
            }
        }); 
        
        
    }
};




console.log(Math.abs(5 - 5) + Math.abs(5 - 4))






// function checkLocation () {
//   if ( 'geolocation' in navigator) {
//   console.log(navigator);
//   console.log ( 'geolocation available');
//   console.log(navigator.geolocation.getCurrentPosition);
    
//     //navigator geolocation getcurrentposition takes a callback function as an argument (provides coords when they are available )
//   navigator.geolocation.getCurrentPosition(function(e) {
//     console.log(e);
//     renderLoc(e.coords.latitude, e.coords.longitude);
//   }
                                          
//   );

//   } else {
//   console.log ('geolocation not available');
//   }

//   function renderLoc (lat, lon) {
//     if (Math.abs(lat - tommyLat) < .001 && Math.abs(lon - tommyLong) < .001 ) {
//       console.log('youre there');
//       infoField.innerHTML = "you're there 🌎"
//       soundy.play();
//     }
//     else {
//       console.log('nope not there');
//       infoField.innerHTML = "nope not there 👎🏼"
//     }
    
//     //second site
    
//     if (Math.abs(lat - eltonsLat) < .001 && Math.abs(lon - eltonsLong) < .001 ) {
//       console.log('youre there');
//       infoField.innerHTML = "you're there 🌎"
//       soundy.play();
//     }
//     else if (Math.abs(lat - eltonsLat) < .001 && Math.abs(lon - tommyLong)) {
             
             
//       console.log('nope not there');
//       infoField.innerHTML = "nope not there 👎🏼"
//     }
//   }

// }

