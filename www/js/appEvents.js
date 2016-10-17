var appEvents = {
  ready : function() {
    var currentTime = new Date();
    // Check if we have a stored result
    if (appData.getLastUpdated()) {
      // If we do, check if it's still valid (< 1 hour old)
      console.log(((Date.parse(currentTime) - appData.getLastUpdated()) / 1000 / 60).toFixed(0), "minutes");
      if (Date.parse(currentTime) - appData.getLastUpdated() < 3600000 ) {
        // If still valid, display cached data
        var lastData = appData.getLastWeather();
        ui.updateUI(lastData, appData.getLastUpdated());
        // Check location to see if location changed
        appMethods.getCurrentLocation(false);
      }
      else {
        // Force wether update even if location hasn't changed much
        appMethods.getCurrentLocation(true);
      }
    }
    else {
      // Since no old data, likely first run so run through everything
      appMethods.getCurrentLocation(true);
    }
  },

  weatherAPISuccess : function(currentData, futureData) {
    // Update the cached data
    appData.setLastUpdated(Date.now());
    appData.setLastWeather([currentData, futureData]);
    // Update UI
    ui.updateUI([currentData, futureData], Date.now());
  },

  weatherAPIFailure : function (error) {
    if (error === "OFFLINE") {
      navigator.notification.alert(
        'Unable to update weather due to no internet connection.',  
        this.alertDismissed(error),      
        'No Connection',            
        'OK'                  
      );
    }
    else {
      navigator.notification.alert(
        'Unable to update weather due to an error.',  
        this.alertDismissed(error),         
        'Error',            
        'OK'                  
      );
    }
  },

  locationRecieved : function(latlng, forced) {
    // Check if location has changed
    var oldLocation = appData.getLastLocation();
    var locationChanged = false;
    if (oldLocation) {
      locationChanged = oldLocation.lat.toFixed(1) !== latlng.lat.toFixed(1) ||
        oldLocation.lng.toFixed(1) !== latlng.lng.toFixed(1);
    }
    if (locationChanged || forced) {
      // Store the last location object
      appData.setLastLocation(latlng);
      // Use the location to get weather data from API
      appMethods.getWeatherData(latlng);
    }
    // Do nothing unless location changed or forced
  },

  locationError : function(error) {
    navigator.notification.alert(
      'Unable to get location information. Please check permissions.',  
      this.alertDismissed(error),      
      'Geolocation Error',            
      'OK'                  
    );
  },

  alertDismissed : function(originalMessage) {
    // Show cached data if there is any
    if (appData.getLastUpdated()) {
      // If still valid, display cached data
      console.log('error: using cached data');
      var lastData = appData.getLastWeather();
      ui.updateUI(lastData, appData.getLastUpdated());
    }
    else {
      navigator.notification.alert(
        'Unable to update weather data and no cached data found.',  
        function() {
          console.log("No data to display");
        },      
        'No Data',            
        'OK'                  
      );
      ui.hideLoader();
    }
  },

  menuOpen : function() {
    document.getElementById('settings').classList.toggle('open');
  },

  menuClose : function() {
    document.getElementById('settings').classList.remove('open');
  },

  menuClick : function() {
    // Call the function with the proper name in the menuMethods variable
    menuMethods[this.getAttribute("data-name")].call();
  },

  swipe : function(direction) {
    direction === 'L' ? views.moveRight() : views.moveLeft();
  }
}