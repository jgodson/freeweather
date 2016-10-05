var userSettings;

var settings = {
  display : {
    'metric' : {
      tempUnit : '&deg;C',
      convertTemp : function(temp) {
        return temp - 273.15;
      }
    },
    'imperial' : {
      tempUnit : '&deg;F',
      convertTemp : function(temp) {
        return temp * 9 / 5 - 459.67;
      }
    }
  }
}

var defaultSettings = {
  system : 'metric',
  backgroundChanges: true,
  dayHours: {
    min : 6,
    max : 20
  }
}