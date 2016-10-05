var defaultSettings = {
  homeLocation : {
    lat : 52.146973,
    lng : -106.647034
  },
  system : {
    'metric' : {
      temp : 'C'
    },
    'imperial' : {
      temp : 'F'
    }
  },
  backgroundChanges : true
}

var settings = appData.getSettings() || defaultSettings;