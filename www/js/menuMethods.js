var menuMethods = {
  "temp-units" : function() {
    if (userSettings.system == "metric") {
      userSettings.system = "imperial";
    }
    else {
      userSettings.system = "metric";
    }
    appData.setSettings(userSettings);
    ui.updateUI(appData.getLastWeather(), appData.getLastUpdated());
  },

  "force-refresh" : function() {
    if (cordova.platformId != 'android') {
      StatusBar.backgroundColorByHexString("#141414");
    }
    ui.showLoader();
    appMethods.getCurrentLocation(true);
  },

  "settings" : function() {
    if (document.getElementById('settings-view').classList.length == 0) {
      views.openSettings();
    }
    else {
      views.closeSettings();
    }
  }
}