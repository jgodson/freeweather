var userSettings;

var settings = {
  display : {
    'metric' : {
      tempUnit : '&deg;C',
      measurementUnit : 'mm',
      windUnit : 'km/h',
      pressureUnit : 'kPa',
      convertTemp : function(temp) {
        return temp - 273.15; // celcius
      },
      convertMeasurement : function(mm) {
        return mm; // already in mm
      },
      convertWindSpeed : function(mps) {
        return mps * 3.6;
      },
      convertPressure : function(hpa) {
        return hpa / 10;
      }
    },
    'imperial' : {
      tempUnit : '&deg;F',
      measurementUnit : 'in',
      windUnit : 'mph',
      pressureUnit : 'mb',
      convertTemp : function(temp) {
        return temp * 9 / 5 - 459.67; // fahrenheit
      },
      convertMeasurement : function(mm) {
        return mm * 0.039370; // convert to inches
      },
      convertWindSpeed : function(mps) {
        return mps * 2.23694;
      },
      convertPressure : function(hpa) {
        return hpa;
      }
    }
  },

  defaultSettings : {
    system : 'metric',
    backgroundChanges: true
  }
}