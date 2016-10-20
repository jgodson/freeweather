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
  },

  setLastSunset : function(time) {
    localStorage.setItem("lastSunset", time);
  },

  getLastSunset : function () {
    return parseInt(localStorage.getItem("lastSunset"));
  }
}

var constants = {
  DAYMAP : { 
    Sun : "sunday",
    Mon : "monday",
    Tue : "tuesday",
    Wed : "wednesday",
    Thu : "thursday",
    Fri : "friday",
    Sat : "saturday"
  },
  TEMPMAP : {
    C : "Celcius",
    F : "Farenheit"
  },
  UNITMAP : {
    mm : "Milimeters",
    in : "Inches"
  }
}