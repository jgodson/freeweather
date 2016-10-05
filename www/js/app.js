var appEvents = {
  ready : function() {
    userSettings = appData.getSettings() || defaultSettings;
    var currentTime = new Date();
    // Check if we have a stored result
    if (appData.getLastUpdated()) {
      // If we do, check if it's still valid < 1 hour old
      console.log(((Date.parse(currentTime) - appData.getLastUpdated()) / 1000 / 60).toFixed(0), "minutes");
      if (Date.parse(currentTime) - appData.getLastUpdated() < 3600000 ) {
        // If still valid, display cached data
        var lastData = appData.getLastWeather();
        ui.updateWeatherData(lastData);
        ui.updateTime(appData.getLastUpdated());
        ui.updateLocation(lastData.city.name, lastData.city.country);
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

  weatherAPISuccess : function(data) {
    // Update the cached data
    appData.setLastUpdated(Date.now());
    appData.setLastWeather(data);
    // Update the last updated time with the current timestamp
    ui.updateTime(Date.now());
    // Update the City and Country in the UI
    ui.updateLocation(data.city.name, data.city.country);
    // Update the weather data
    ui.updateWeatherData(data);
    // Update the future weather list
    ui.updateFutureWeather(data);
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
      locationChanged = oldLocation.lat.toFixed(2) !== latlng.lat.toFixed(2) ||
        oldLocation.lng.toFixed(2) !== latlng.lng.toFixed(2);
    }
    console.log("location changed", locationChanged);
    if (locationChanged || forced) {
      // Store the last location object
      appData.setLastLocation(latlng);
      // Use the location to get current weather from API
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
    // Log it to the console for debug
    console.log(originalMessage);
  }
}

var appMethods = {
  getCurrentLocation : function(forced) {
    navigator.geolocation.getCurrentPosition(function(location) {
        appEvents.locationRecieved({
          lat : location.coords.latitude, 
          lng : location.coords.longitude
        }, forced);
      }, function(error) {
        appEvents.locationError(error);
      }
    );
  },

  getWeatherData : function(location) {
    if (location.lat && location.lng) {
      if (navigator.onLine) {
        console.log("Getting new weather data");
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", config.buildAPIString(location.lat, location.lng), true);
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {
              appEvents.weatherAPISuccess(JSON.parse(this.responseText));
            }
            else {
              appEvents.weatherAPIFailure(this.status);
            }
          }
        }
        xhttp.send();
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

var ui = {
  updateLocation : function(city, country) {
    document.getElementById('weather-primary').getElementsByTagName('div')[0]
      .innerText = city + ", " + country;
  },

  updateWeatherData : function(weatherData) {
    var mainElement = document.getElementById('weather-primary');
    var img = mainElement.getElementsByTagName('img')[0];
    var tempdiv = mainElement.getElementsByTagName('div')[1];

    var today = weatherData.list[0];
    // Update the background if setting allows
    if (userSettings.backgroundChanges) this.updateBackground();
    // Set the weather icon to the proper image
    img.src = "img/icons/" + today.weather[0].icon + ".png";
    // Convert temperature to proper units
    var temperature = settings.display[userSettings.system].convertTemp(today.main.temp).toFixed(1);
    tempdiv.innerHTML = temperature + ' ' + settings.display[userSettings.system].tempUnit;
    // After everything is updated, hide the loader screen
    this.hideLoader();
  },

  updateFutureWeather : function(data) {
    var mainElement = document.getElementById('weather-future');
    var html = "";
    for (var i = 4; i <= 24; i += 4) {
      var imgsrc = "img/icons/" + data.list[i].weather[0].icon + ".png";
      html += "<div class='w-future'><span class='w-time'>";
      html += data.weather[i].dt_txt.substring(4, 16) + "</span>";
      html += "<img class='small-icon' src='" + imgsrc + "' />";
      var temp = settings.display[userSettings.system].convertTemp(data.list[i].main.temp).toFixed(1);
      html += "<div class='w-temp'>" + temp + ' ' + settings.display[userSettings.system].tempUnit;
      html += "</div></div>";
    }
    console.log(html);
    mainElement.innerHTML = html;
  },

  updateBackground : function() {
    var currentHour = new Date().getHours();
    if (currentHour >= userSettings.dayHours.min 
      && currentHour < userSettings.dayHours.max) {

    }
  },

  updateTime : function(time) {
    time = new Date(time).toString().split('G')[0].trim();
    var ampm = 'AM';
    time = time.split(' ');
    time[4] = time[4].split(':');
    if (parseInt(time[4][0]) > 12) ampm = 'PM';
    if (ampm == 'PM') time[4][0] = parseInt(time[4][0]) - 12;
    time[4] = time[4].join(':');
    time = time.join(' ') + " " + ampm;
    document.getElementById('weather-updated').innerText = time;
  },

  hideLoader : function() {
    document.getElementById('loader').classList.add('hidden');
  },

  showLoader : function() {
    document.getElementById('loader').classList.remove('hidden');
  }
}

// Getters and setters for local storage
var appData = {
    setSettings : function(settings) {
      localStorage.setItem("settings", JSON.stringify(settings));
    },

    getSettings : function() {
      return JSON.parse(localStorage.getItem("settings"));
    }, 

    setLastUpdated : function(time) {
      localStorage.setItem("lastUpdated", time);
    },

    getLastUpdated : function() {
      return parseInt(localStorage.getItem("lastUpdated"));
    },

    setLastWeather : function (weatherData) {
      localStorage.setItem("lastWeatherData", JSON.stringify(weatherData));
    },

    getLastWeather : function() {
      return JSON.parse(localStorage.getItem("lastWeatherData"));
    },

    setLastLocation : function(location) {
      localStorage.setItem("lastLocation", JSON.stringify(location));
    },

    getLastLocation : function() {
      return JSON.parse(localStorage.getItem("lastLocation"));
    }

}