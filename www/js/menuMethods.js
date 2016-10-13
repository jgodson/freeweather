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
  },
  "settings" : function() {
    // Settings buttons/actions
    settingsMethods = {
      "close" : function() {
        settingsDiv.classList.remove('inView');
        modifyListeners('remove');
      }
    }

    var settingsDiv = document.getElementById('settings-view');
    var buttons = settingsDiv.getElementsByTagName('button');

    // If settings is not open, show it. If it is, hide it.
    if (settingsDiv.classList.length == 0) {
      settingsDiv.classList.add('inView');
      modifyListeners('add');
    }
    else {
      settingsDiv.classList.remove('inView');
      modifyListeners('remove');
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
  }
}