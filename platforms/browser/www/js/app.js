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
        console.log('using previous data');
        var lastData = appData.getLastWeather();
        console.log('got last weather data');
        ui.updateTime(appData.getLastUpdated());
        console.log('updated time');
        ui.updateLocation(lastData.city.name, lastData.city.country);
        console.log('updated city');
        ui.updateFutureWeather(lastData);
        console.log('updated future weather data');
        ui.updateWeatherData(lastData);
        console.log('updated weather data')
        // Check location to see if location changed
        appMethods.getCurrentLocation(false);
        console.log('checked location data');
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
    // Update the future weather list
    ui.updateFutureWeather(data);
    // Update the weather data
    ui.updateWeatherData(data);
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
    console.log("gettings location");
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
    var tempdiv = mainElement.getElementsByTagName('div')[2];
    var today = weatherData.list[0];
    // Update the background if setting allows
    if (userSettings.backgroundChanges) this.updateBackground();
    // Set the weather icon to the proper image
    img.src = "img/icons/" + today.weather[0].icon + ".png";
    // Convert temperature to proper units and show
    var temperature = settings.display[userSettings.system].convertTemp(today.main.temp).toFixed(1);
    tempdiv.innerHTML = temperature + ' ' + settings.display[userSettings.system].tempUnit;
    // Update the description
    mainElement.getElementsByTagName('div')[1].innerText = today.weather[0].description;
    // Update the rain and snow % chance
    var precipdiv = document.getElementById('weather-chance');
    // rain chance %
    if (today.rain) {
      precipdiv.children[0].children[2].innerText = ((today.rain['3h'] || 0) * 100).toFixed(1) + '%';
    }
    else {
      precipdiv.children[0].children[2].innerText = '0.0%';
    }
    // snow chance %
    if (today.snow) {
      precipdiv.children[0].children[4].innerText = ((today.snow['3h'] || 0) * 100).toFixed(1) + '%';
    }
    else {
      precipdiv.children[0].children[4].innerText = '0.0%';
    }
    // After everything is updated, hide the loader screen
    this.hideLoader();
  },

  updateFutureWeather : function(data) {
    var mainElement = document.getElementById('weather-future').children[0];
    var html = "";
    for (var i = 1; i < data.cnt; i++) {
      var imgsrc = "img/icons/" + data.list[i].weather[0].icon + ".png";
      html += "<div class='w-future'><span class='w-time'>";
      html += this.convertTime(data.list[i].dt_txt, true).substring(4, 20) + "</span>";
      html += "<img class='small-icon' src='" + imgsrc + "' />";
      var temp = settings.display[userSettings.system].convertTemp(data.list[i].main.temp).toFixed(1);
      html += "<span class='w-temp'>" + temp + ' ' + settings.display[userSettings.system].tempUnit;
      html += "</span></div>";
    }
    mainElement.innerHTML = html;
  },

  updateBackground : function() {
    var currentHour = new Date().getHours();
    var bodyElement = document.getElementsByTagName('body')[0];
    if (currentHour >= userSettings.dayHours.min 
      && currentHour < userSettings.dayHours.max) {
        bodyElement.classList.remove('night');
        bodyElement.classList.add('day');
    }
    else {
      bodyElement.classList.remove('day');
      bodyElement.classList.add('night');
    }
  },

  updateTime : function(time) {
    document.getElementById('weather-updated').innerText = this.convertTime(time);
  },

  convertTime : function(time, excludeYear) {
    if (typeof time != 'number') {
      // Convert it to something we can use for certain
      //2016-10-06 18:00:00
      time = time.split(' '); // [2016-10-06, 18:00:00]
      time[0] = time[0].split('-'); // [2016, 10, 06]
      time[1] = time[1].split(':'); // [18, 00, 00]
      // Date(year, month - 1 for 0 index, day, hours, minutes, seconds, milliseconds)
      time = new Date(time[0][0], time[0][1] - 1, time[0][2], time[1][0], time[1][1], time[1][2])
        .toString().split('G')[0].trim(); // Create date and remove timezone
    } 
    else {
      time = new Date(time).toString().split('G')[0].trim(); // Make it a date and remove timezone
    }
    var ampm = 'AM';
    time = time.split(' '); // split date/time into array
    if (excludeYear) time[3] = ""; // remove year if desired
    time[4] = time[4].split(':'); // split time into array
    time[4].pop(); // Remove seconds
    if (parseInt(time[4][0]) >= 12) ampm = 'PM'; // check if am/pm
    if (parseInt(time[4][0]) == 0 ) time[4][0] = parseInt(time[4][0]) + 12;
    if (parseInt(time[4][0]) != 12 && ampm == 'AM') time[4][0] = time[4][0].substring(1);
    if (parseInt(time[4][0]) > 12 && ampm == 'PM') time[4][0] = parseInt(time[4][0]) - 12; // subtract 12 hours if > 12
    time[4] = time[4].join(':'); // combine time into string
    time = time.join(' ') + " " + ampm; // combine into date/time string and add am/pm
    return time;
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