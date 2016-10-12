var appMethods = {
  getCurrentLocation : function(forced) {
    navigator.geolocation.getCurrentPosition(function(location) {
        appEvents.locationRecieved({
          lat : location.coords.latitude, 
          lng : location.coords.longitude
        }, forced);
      }, function(error) {
        appEvents.locationError(error);
      },{
       timeout: 5000 // timeout so it doesn't sit there forever
      }
    );
  },

  getWeatherData : function(location) {
    if (location.lat && location.lng) {
       if (navigator.onLine) {
        var xhttpA = new XMLHttpRequest();
        var xhttpB = new XMLHttpRequest();
        var completed = false; // To make sure APISuccess event only fired once
        xhttpA.open("GET", config.buildCurrentAPIString(location.lat, location.lng), true);
        xhttpA.onreadystatechange = function() {
          // Check if both requests are finished
          if (this.readyState == 4 && xhttpB.readyState == 4) {
            if (this.status == 200 && xhttpB.status == 200) {
              if (!completed) {
                appEvents.weatherAPISuccess(
                  JSON.parse(this.responseText),
                  JSON.parse(xhttpB.responseText)
                );
                completed = true;
              }
            }
            else {
              if (!completed) appEvents.weatherAPIFailure(this.status);
            }
          }
        }
        xhttpA.send(); // Send current weather request

        xhttpB.open("GET", config.buildFutureAPIString(location.lat, location.lng), true);
        xhttpB.onreadystatechange = function() {
          // Check if both results are finished
          if (this.readyState == 4 && xhttpA.readyState == 4) {
            if (this.status == 200 && xhttpB.status == 200) {
              if (!completed) {
                appEvents.weatherAPISuccess(
                  JSON.parse(xhttpA.responseText),
                  JSON.parse(this.responseText)
                );
                completed = true;
              }
            }
            else {
              if (!completed) appEvents.weatherAPIFailure(this.status);
            }
          }
        }
        xhttpB.send(); // Send future weather request
       }
       else {
         appEvents.weatherAPIFailure('OFFLINE');
       }
    }
    else {
      appEvents.locationError("Location data invalid");
    }
  }
}