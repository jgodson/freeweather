var ui = {
  updateLocation : function(city, country) {
    document.getElementById('weather-primary').getElementsByTagName('div')[0]
      .innerText = city + ", " + country;
  },

  updateWeatherData : function(today) {
    var mainElement = document.getElementById('weather-primary');
    var img = mainElement.getElementsByTagName('img')[0];
    var tempdiv = mainElement.getElementsByTagName('div')[2];
    // Set the weather icon to the proper image
    img.src = "img/icons/" + today.weather[0].icon + ".png";
    // Convert temperature to proper units and show
    var temperature = settings.display[userSettings.system].convertTemp(today.main.temp).toFixed(1);
    tempdiv.innerHTML = temperature + ' ' + settings.display[userSettings.system].tempUnit;
    // Update the description
    mainElement.getElementsByTagName('div')[1].innerText = today.weather[0].description;
    // Update the rain and snow % chance
    var precipdiv = document.getElementById('weather-chance');
    // rain chance %
    if (today.rain) {
      precipdiv.children[0].children[2].innerText = 
        settings.display[userSettings.system].convertMeasurement(today.rain['3h']).toFixed(2)
        + ' ' + settings.display[userSettings.system].measurementUnit;
    }
    else {
      precipdiv.children[0].children[2].innerText = 'none';
    }
    // snow chance %
    if (today.snow) {
      precipdiv.children[0].children[4].innerText = 
        settings.display[userSettings.system].convertMeasurement(today.snow['3h']).toFixed(2)
        + ' ' + settings.display[userSettings.system].measurementUnit;
    }
    else {
      precipdiv.children[0].children[4].innerText = 'none';
    }
  },

  updateFutureWeather : function(data) {
    var mainElement = document.getElementById('weather-future').children[0];
    var html = "";
    for (var i = 0; i < data.cnt; i++) {
      var imgsrc = "img/icons/" + data.list[i].weather[0].icon + ".png";
      html += "<div class='w-future'><span class='w-time'>";
      html += this.convertTime(data.list[i].dt_txt, true).substring(4, 20) + "</span>";
      html += "<img class='small-icon' src='" + imgsrc + "' />";
      var temp = settings.display[userSettings.system].convertTemp(data.list[i].main.temp).toFixed(1);
      html += "<span class='w-temp'>" + temp + ' ' + settings.display[userSettings.system].tempUnit;
      html += "</span></div>";
    }
    mainElement.innerHTML = html;
  },

  updateBackground : function() {
    var currentHour = new Date().getHours();
    var bodyElement = document.getElementsByTagName('body')[0];
    if (currentHour >= userSettings.dayHours.min 
      && currentHour < userSettings.dayHours.max) {
        bodyElement.classList.remove('night');
        bodyElement.classList.add('day');
        if (cordova.platformId != 'android') {
          StatusBar.backgroundColorByHexString("#419BD3");
        }
    }
    else {
      bodyElement.classList.remove('day');
      bodyElement.classList.add('night');
      if (cordova.platformId != 'android') {
        StatusBar.backgroundColorByHexString("#7979C1");
      }
    }
  },

  updateTime : function(time) {
    document.getElementById('weather-updated').innerText = this.convertTime(time);
  },

  convertTime : function(time, excludeYear) {
    if (typeof time != 'number') {
      // iPhone was having issues converting this just using new Date(time)
      // 2016-10-06 18:00:00
      time = time.split(' '); // [2016-10-06, 18:00:00]
      time[0] = time[0].split('-'); // [2016, 10, 06]
      time[1] = time[1].split(':'); // [18, 00, 00]
      // Date(year, month - 1 for 0 index, day, hours, minutes, seconds, milliseconds)
      time = new Date(Date.UTC(time[0][0], parseInt(time[0][1]) - 1, time[0][2], time[1][0], time[1][1], time[1][2]))
        .toString().split('G')[0].trim(); // Create date and remove timezone
    } 
    else {
      time = new Date(time).toString().split('G')[0].trim(); // Make it a date and remove timezone
    }
    var ampm = 'AM';
    time = time.split(' '); // split date/time into array
    if (excludeYear) time[3] = ""; // remove year if desired
    time[4] = time[4].split(':'); // split time into array
    time[4].pop(); // Remove seconds
    if (parseInt(time[4][0]) >= 12) ampm = 'PM'; // check if am/pm
    if (parseInt(time[4][0]) == 0 ) time[4][0] = parseInt(time[4][0]) + 12;
    if (parseInt(time[4][0]) < 10 && ampm == 'AM') time[4][0] = time[4][0].substring(1); // remove 0 if only 1 digit
    if (parseInt(time[4][0]) > 12 && ampm == 'PM') time[4][0] = parseInt(time[4][0]) - 12; // subtract 12 hours if > 12
    time[4] = time[4].join(':'); // combine time into string
    time = time.join(' ') + " " + ampm; // combine into date/time string and add am/pm
    return time;
  },

  updateUI : function(data, time) {
    // data is array [0] current weather [1] future weather
    this.updateTime(time);
    this.updateLocation(data[0].name, data[0].sys.country);
    this.updateFutureWeather(data[1]);
    // Update the background if setting allows
    if (userSettings.backgroundChanges) this.updateBackground();
    this.updateWeatherData(data[0]);
    // After everything is updated, hide the loader screen
    this.hideLoader();
  },

  hideLoader : function() {
    document.getElementById('loader').classList.add('hidden');
  },

  showLoader : function() {
    document.getElementById('loader').classList.remove('hidden');
  }
}