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
    ui.showLoader();
    appMethods.getCurrentLocation(true);
  }
}