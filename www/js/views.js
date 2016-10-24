var views = {
  viewList : [],
  index : 0,

  initialize : function() {
    var allViews = document.getElementsByClassName('view');
    for (var i = 0; i < allViews.length; i++) {
      this.viewList.push(allViews[i].id);
    }
    this.initializeSettings();
  },

   initializeSettings : function() {
    // Settings buttons/actions
    var settingsMethods = {
      "close" : function() {
        views.closeSettings();
      },

      "background" : function() {
        userSettings.backgroundChanges = !userSettings.backgroundChanges;
        appData.setSettings(userSettings);
        if (!userSettings.backgroundChanges) {
          document.getElementsByTagName('body')[0].classList = ""
          ui.updateStatusBar("#A7A7A7");
        }
        else {
          ui.updateBackground(false);
        }
      }
    }

    var settingsView = document.getElementById('settings-view');
    var buttons = settingsView.getElementsByTagName('button');
    var checkboxes = settingsView.getElementsByTagName('input');

    // initialize settings
    if (userSettings.backgroundChanges) checkboxes[0].checked = true;

    var longestArray = buttons.length > checkboxes.length ? buttons.length : checkboxes.length;
    for (var i = 0; i < longestArray; i++) {
      if (buttons[i] != undefined) {
        buttons[i].addEventListener('touchstart', settingsButtonClick, false);
      }
      if (checkboxes[i] != undefined) {
        checkboxes[i].addEventListener('click', settingsButtonClick, false);
      }
    }

    // Handler for clicking on one of the buttons in settings view
    function settingsButtonClick() {
      settingsMethods[this.getAttribute("data-action")].call();
    }
  },
  
  openSettings : function() {
    document.getElementById('settings-view').classList.add('inView');
    ui.updateStatusBar("#A7A7A7");
  },

  closeSettings : function() {
      document.getElementById('settings-view').classList.remove('inView');
      setTimeout(function() {
        if (document.getElementsByTagName('body')[0].classList[0] == 'day') {
          ui.updateStatusBar("#419BD3");
        }
        else if (document.getElementsByTagName('body')[0].classList[0] == 'night') {
          ui.updateStatusBar("#7979C1");
        }
      }, 410);
    },

  moveLeft : function() {
    // Swipe Right
    var currentElement = document.getElementById(this.viewList[this.index]);
    if (this.viewList[this.index - 1] !== undefined) {
      currentElement.style.right = (+currentElement.style.right || 0) - 100 + '%';
      currentElement.classList.remove('inView');
      this.index--;
      document.getElementById(this.viewList[this.index]).classList.add('inView');
      document.getElementById(this.viewList[this.index]).style.right = 0;
    }
    else {
      currentElement.classList.add('jiggle');
      setTimeout(function() {
        currentElement.classList.remove('jiggle');
      }, 60)
    }
  },

  moveRight : function() {
    // Swipe Left
    var currentElement = document.getElementById(this.viewList[this.index]);
    if (this.viewList[this.index + 1] !== undefined) {
      currentElement.style.right = (+currentElement.style.right || 0) + 100 + '%';
      currentElement.classList.remove('inView');
      this.index++;
      document.getElementById(this.viewList[this.index]).classList.add('inView');
      document.getElementById(this.viewList[this.index]).style.right = 0;
    }
    else {
      currentElement.classList.add('jiggle');
      setTimeout(function() {
        currentElement.classList.remove('jiggle');
      }, 60)
    }
  }
}