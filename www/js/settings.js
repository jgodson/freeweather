var userSettings;

var settings = {
  display : {
    'metric' : {
      tempUnit : '&deg;C',
      measurementUnit : 'mm',
      convertTemp : function(temp) {
        return temp - 273.15; // celcius
      },
      convertMeasurement : function(mm) {
        return mm; // already in mm
      }
    },
    'imperial' : {
      tempUnit : '&deg;F',
      measurementUnit : 'in',
      convertTemp : function(temp) {
        return temp * 9 / 5 - 459.67; // fahrenheit
      },
      convertMeasurement : function(mm) {
        return mm * 0.039370; // convert to inches
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