var appEvents = {
  ready : function() {
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
  },

  weatherAPIFailure : function (error) {
    console.log("No Weather Data Available", error);
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
    console.log(error);
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
      appEvents.locationError("Location data invalid");
    }
  }
}

var ui = {
  updateLocation : function(city, country) {
    document.getElementById('weather-primary').getElementsByTagName('div')[1]
      .innerText = city + ", " + country;
  },

  updateWeatherData : function(weatherData) {
    var mainElement = document.getElementById('weather-primary');
    var img = mainElement.getElementsByTagName('img')[0];
    var div = mainElement.getElementsByTagName('div')[0];

    var today = weatherData.list[0];

    // Set the weather icon to the proper image
    img.src = "img/icons/" + today.weather[0].icon + ".png";
    var temperature = 
    this.hideLoader();
  },

  updateFutureWeather : function(weatherData) {
    var mainElement = document.getElementById('weather-future');
    var html = "";
    for (var i = 4; i <= 24; i += 4) {
      var imgsrc = "img/icons/" + mainElement.weather[i].icon + ".png";
      html += "<div class='w-future'><span class='w-time'>";
      html =+ mainElement.weather[i].dt_txt.substring(4, 16) + "</span>";
      html += "<img src='" + imgsrc + "' />"
      html += ""
    }
  },

  updateTime : function(time) {
    time = new Date(time).toString().split('G')[0].trim();
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