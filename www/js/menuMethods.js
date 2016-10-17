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
    // Settings buttons/actions
    settingsMethods = {
      "close" : function() {
        closeSettings();
      }
    }

    var settingsDiv = document.getElementById('settings-view');
    var buttons = settingsDiv.getElementsByTagName('button');

    // If settings is not open, show it. If it is, hide it.
    if (settingsDiv.classList.length == 0) {
      // On iOS change status bar to match status screen color
      if (cordova.platformId != 'android') {
        StatusBar.backgroundColorByHexString("#A7A7A7");
      }
      settingsDiv.classList.add('inView');
      modifyListeners('add');
    }
    else {
      closeSettings();
    }

    // Handler for clicking on one of the buttons in settings view
    function settingsButtonClick() {
      console.log(this.getAttribute("data-action"));
      settingsMethods[this.getAttribute("data-action")].call();
    }

    // Function to add or remove listeners for buttons in settings view
    function modifyListeners(mode) {
      for (var i = 0; i < buttons.length; i++) {
        if (mode === 'add') {
          buttons[i].addEventListener('touchstart', settingsButtonClick, false);
        }
        else {
          buttons[i].removeEventListener('touchstart', settingsButtonClick, false);
        }
      }
    }

    function closeSettings() {
      modifyListeners('remove');
      settingsDiv.classList.remove('inView');
      setTimeout(function() {
        if (cordova.platformId != 'android') {
          // Call update background to update status bar colors on iOS
          ui.updateBackground();
        }
      }, 410);
    }
  }
}