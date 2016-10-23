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
    tempdiv.innerHTML = temperature + settings.display[userSettings.system].tempUnit;
    // Update the description
    mainElement.getElementsByTagName('div')[1].innerText = today.weather[0].description;
    // Update the rain and snow % chance
    var precipdiv = document.getElementById('weather-chance');
    // rain amounts
    if (today.rain) {
      precipdiv.children[0].children[2].innerText = 
        settings.display[userSettings.system].convertMeasurement(today.rain['3h']).toFixed(2)
        + ' ' + settings.display[userSettings.system].measurementUnit;
    }
    else {
      precipdiv.children[0].children[2].innerText = 'none';
    }
    // snow amounts
    if (today.snow) {
      precipdiv.children[0].children[4].innerText = 
        settings.display[userSettings.system].convertMeasurement(today.snow['3h']).toFixed(2)
        + ' ' + settings.display[userSettings.system].measurementUnit;
    }
    else {
      precipdiv.children[0].children[4].innerText = 'none';
    }
  },

  drawSunriseSunset : function() {
    // "this" in this function can refer to an event instead of the ui object so don't use it
    // Grab the data we need to calculate everything
    var today = appData.getLastWeather()[0],
      progressDiv = document.getElementsByClassName('day-progress')[0],
      childDivs = progressDiv.getElementsByTagName('div'),
      progressImgs = progressDiv.getElementsByTagName('img'),
      progressWidth = progressDiv.clientWidth,
      now = Date.now(),
      sunrise = today.sys.sunrise * 1000,
      sunset = now > sunrise ? today.sys.sunset * 1000 
        : appData.getLastSunset() // Or if there is no last sunset, subtract 1 day from this one
        || new Date(new Date(today.sys.sunset * 1000).setDate(new Date().getDate() -1)).getTime(),
      night = now > sunset,
      percent;
    if (night) {
      percent = (now - sunset) / (sunrise - sunset);
      // Set text near sunrise and sunset icons
      childDivs[0].children[1].innerText = ui.convertTime(sunset).substring(16);
      childDivs[2].children[1].innerText = ui.convertTime(sunrise).substring(16);
    }
    else {
      if (sunset != appData.getLastSunset()) {
        appData.setLastSunset(sunset);
      }
      percent = (now - sunrise) / (sunset - sunrise);
      // Set text near sunrise and sunset icons
      childDivs[0].children[1].innerText = ui.convertTime(sunrise).substring(16);
      childDivs[2].children[1].innerText = ui.convertTime(sunset).substring(16);
    }
    // Adjust position of sun/moon
    progressImgs[1].style.left = (progressWidth - 28) * percent + 'px';
    progressImgs[1].style.top = percent < 0.5 ?
      10 - 38 * (percent * 2) + 'px'
      : 10 - 38 * ((1 - percent) * 2) + 'px';

    if (night) {
        if (now < sunrise) {
        progressImgs[0].src = "img/icons/sunset.png";
        progressImgs[1].src = "img/icons/moon.png";
        progressImgs[2].src = "img/icons/sunrise.png";
      }
      else {
        progressImgs[0].src = "img/icons/sunrise.png";
        progressImgs[1].src = "img/icons/01d.png";
        progressImgs[2].src = "img/icons/sunset.png";
      }
    }
    else {
      if (now < sunset) {
        progressImgs[0].src = "img/icons/sunrise.png";
        progressImgs[1].src = "img/icons/01d.png";
        progressImgs[2].src = "img/icons/sunset.png";
      }
      else {
        progressImgs[0].src = "img/icons/sunset.png";
        progressImgs[1].src = "img/icons/moon.png";
        progressImgs[2].src = "img/icons/sunrise.png";
      }
    }
    
  },

  updateCloudCover : function(data) {
    var element = document.getElementsByClassName('cloud-cover')[0]
      .getElementsByTagName('span')[0];
    element.innerText = (data.clouds.all || 0) + '%';
  },

  updateWind : function(data) {
    var element = document.getElementsByClassName('wind')[0],
      dial = element.getElementsByTagName('img')[1],
      speed = element.getElementsByTagName('span')[1];
    dial.style.transform = "rotate(" + (data.wind.deg + 180) + "deg)"; // point opposite direction
    speed.innerText = 
      settings.display[userSettings.system].convertWindSpeed(data.wind.speed).toFixed(2)
      + " " + settings.display[userSettings.system].windUnit;
  },

  updateHumidityPressure : function(data) {
    var elements = document.getElementsByClassName('humidity-pressure')[0]
      .getElementsByTagName('span');
    elements[0].innerText = (data.main.humidity || 0) + '%';
    elements[1].innerText = 
      settings.display[userSettings.system].convertPressure(data.main.pressure).toFixed(1)
      + " " + settings.display[userSettings.system].pressureUnit;
  },

  updateDaySummary : function(data, days) {
    var element = document.getElementsByClassName('three-day-forecast')[0],
      previousDate,
      currentDate,
      iconCount = {},
      currentIcon,
      currentDay = 0,
      hiTemp = 0,
      loTemp = 9999,
      rain = 0,
      snow = 0,
      html = '';
    // generate html from values
    for (var i = 0; currentDay < days ; i++) {
      currentDate = this.convertTime(data.list[i].dt_txt, true).substring(0, 3);
      if (!previousDate) previousDate = currentDate;
      if (currentDate != previousDate) {
        // get/store today's high and low (or change if different from previous)
        if (currentDay == 0) {
          var previousData = appData.getTodayTemps();
          var today = ui.convertTime(Date.now()).substring(4, 15);
          if (previousData && previousData.date == today) {
            if (hiTemp > previousData.temps.hi || loTemp < previousData.temps.lo) {
              appData.setTodayTemps(previousData.date, 
                {
                  hi : hiTemp > previousData.temps.hi ? hiTemp : previousData.temps.hi,
                  lo : loTemp < previousData.temps.lo ? loTemp : previousData.temps.lo
              });
            }
            else {
              if (previousData.temps.hi > hiTemp) hiTemp = previousData.temps.hi;
              if (previousData.temps.lo < loTemp) loTemp = previousData.temps.lo;
            }
          }
          else {
            appData.setTodayTemps(today, 
              {
                hi : hiTemp,
                lo : loTemp
            });
          }
          html += "<div><span>TODAY</span>";
        }
        else {
          html += "<div><span>" + previousDate.toUpperCase() + "</span>";
        }
        var topIcon = Object.keys(iconCount).sort(function(keyA, keyB) {
          if (iconCount[keyA] > iconCount[keyB]) return 1;
          if (iconCount[keyA] < iconCount[keyB]) return -1;
          return 0;
        });
        html += "<div><div><img class='small-icon' src='img/icons/" + topIcon[0]
        + "d.png' /></div>";
        html += 
          "<div>HI " + settings.display[userSettings.system].convertTemp(hiTemp).toFixed(1) 
          + settings.display[userSettings.system].tempUnit
          + "</div>"
        html += "<div>LO " + settings.display[userSettings.system].convertTemp(loTemp).toFixed(1) 
          + settings.display[userSettings.system].tempUnit + "</div>";
        html += "<div><img class='small-icon' src='img/icons/rain-chance.png' /><span class='space-left'>";
          if (rain > 0) {
            html += settings.display[userSettings.system].convertMeasurement(rain).toFixed(2) + " "
              + " " + settings.display[userSettings.system].measurementUnit + "</span></div>";
          }
          else {
            html += " none</span></div>";
          }
          html += "<div><img class='small-icon' src='img/icons/snow-chance.png' /><span class='space-left'>";
          if (snow > 0) {
            html += settings.display[userSettings.system].convertMeasurement(snow).toFixed(2)
              + " " + settings.display[userSettings.system].measurementUnit + "</span></div>";
          }
          else {
            html += " none</span></div>";
          }
          html += "</div></div>";
        // reset values
        previousDate = currentDate;
        currentDay++;
        hiTemp = 0;
        loTemp = 9999;
        snow = 0;
        rain = 0;
        iconCount = {};
      }
        currentIcon = data.list[i].weather[0].icon.substring(0,2);
        if (data.list[i].main.temp > hiTemp) hiTemp = data.list[i].main.temp;
        if (data.list[i].main.temp < loTemp) loTemp = data.list[i].main.temp;
        if (data.list[i].rain) {
          if (data.list[i].rain['3h']) rain += data.list[i].rain['3h'];
        } 
        if (data.list[i].snow) {
          if (data.list[i].snow['3h']) snow += data.list[i].snow['3h'];
        } 
        iconCount[currentIcon] ? iconCount[currentIcon]++ 
          : iconCount[currentIcon] = 1;
    }
    element.innerHTML = html;
  },

  updateFutureWeather : function(data) {
    var mainElement = document.getElementById('weather-future').children[0],
      date,
      temp,
      html = "",
      previousDay,
      today,
      precipitation,
      currentTime = this.convertTime(Date.now(), true).substring(0, 20);
    for (var i = 0; i < data.cnt; i++) {
      var imgsrc = "img/icons/" + data.list[i].weather[0].icon + ".png";
      date = this.convertTime(data.list[i].dt_txt, true).substring(0, 20);
      // Add labels for what day it is
      today = date.substring(0, 3);
      if (previousDay != undefined) {
        if (today != previousDay) {
          html += "<div class='day-group'>" + constants.DAYMAP[today].toUpperCase();
          html += " " + date.substring(4, 10).toUpperCase() + "</div>";
          previousDay = today;
        }
      }
      else {
        if (currentTime.search(/(\d[0,1]|\s9):[0-9][0-9] PM/) > -1) { // If 9PM or later, is for tomorrow
          html += "<div class='day-group'>TOMORROW " + date.substring(4, 10).toUpperCase() + "</div>";
        }
        else {
          html += "<div class='day-group'>TODAY " + date.substring(4, 10).toUpperCase() + "</div>";
        }
        previousDay = today;
      }
      // Fill in each card
      html += "<div class='w-future'><span class='w-time'>";
      html += date.substring(11) + "</span>";
      html += "<img class='small-icon' src='" + imgsrc + "' />";
      temp = settings.display[userSettings.system].convertTemp(data.list[i].main.temp).toFixed(1);
      html += "<span class='w-temp'>" + temp + ' ' + settings.display[userSettings.system].tempUnit;
      html += "</span></div>";
    }
    mainElement.innerHTML = html;
  },

  chartMethods : {
    chart : null,
    maxPoints : undefined,
    chartTitle : "Five Day Trend",
    drawHourlyChart : function(hourlyData) {
      this.clearChart();
      Chart.defaults.global.defaultFontColor = "#000";
      var tUnits = constants.TEMPMAP[settings.display[userSettings.system].tempUnit.substring(5)];
      var mUnits = constants.UNITMAP[settings.display[userSettings.system].measurementUnit];
      var ctx = document.getElementById("hourlyChart");
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: hourlyData,
        options : {
          title : {
            display : true,
            text : this.chartTitle,
            fontSize : 18,
            padding : 20
          },
          tooltips : {
            mode : 'label',
            titleFontSize : 18,
            bodyFontSize : 14
          },
          scales : {
            yAxes : [
              {
                position : 'right',
                id : 'temp',
                scaleLabel : {
                  display : true,
                  labelString : tUnits
                },
                ticks : {
                  stepSize : tUnits == 'Celcius' ? 5 : 10
                }
              },
              {
                position : 'left',
                id : 'precipitation',
                scaleLabel : {
                  display : true,
                  labelString : mUnits
                },
                gridLines : {
                  drawOnChartArea : false
                },
                ticks : {
                  beginAtZero : true,
                  stepSize : mUnits == 'Milimeters' ? 0.5 : 0.1
                }
              }
            ]
          }
        }
      });
    },

    initializeChart : function(data, maxPoints) {
      if (!this.maxPoints) this.maxPoints = data.cnt;
      var chartData = {
        labels : [],
        datasets : [
          {
            type: 'line',
            label: "Temperature",
            fill: false,
            lineTension: 0.3,
            backgroundColor: "rgba(40, 224, 218, 0.4)",
            borderColor: "rgba(0, 85, 255, 1)",
            borderCapStyle: 'round',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'round',
            pointBorderColor: "rgba(40, 224, 218, 1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(40, 224, 218, 1)",
            pointHoverBorderColor: "rgba(0, 0, 0, 1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [],
            spanGaps: false
          },
          {
            type : 'bar',
            label : 'Precipitation',
            yAxisID : 'precipitation',
            backgroundColor : 'rgba(247, 160, 126, 0.8)',
            borderColor : 'rgba(247, 160, 126, 1)',
            borderWidth : 1,
            hoverBorderWidth : 2,
            data : []
          }
        ]
      };
      var date,
        temp,
        precipitation;
      for (var i = 0; i < this.maxPoints && data.list[i] != undefined; i++) {
        date = ui.convertTime(data.list[i].dt_txt, true).substring(0, 20);
        temp = settings.display[userSettings.system].convertTemp(data.list[i].main.temp).toFixed(1);
        // Add date and temp to chart data
        chartData.labels.push(date.substring(0, 3) + date.substring(10));
        chartData.datasets[0].data.push(temp);
        // Add precipitation to chart data
        precipitation = data.list[i].rain ? 
          settings.display[userSettings.system].convertMeasurement(data.list[i].rain['3h']) || 0 
          : 0;
        precipitation += data.list[i].snow ? 
          settings.display[userSettings.system].convertMeasurement(data.list[i].snow['3h']) || 0 
          : 0;
        chartData.datasets[1].data.push(precipitation.toFixed(2));
      }
      this.drawHourlyChart(chartData);
    },

    changeChartDays : function(days) {
      // redraw chart with proper # of points. 8 points per day
      var DAYS = {
        1 : "One",
        3 : "Three",
        5 : "Five"
      }
      this.maxPoints = 8 * days;
      this.chartTitle = DAYS[days] + " Day Trend";
      this.initializeChart(appData.getLastWeather()[1]);
    },

    clearChart : function() {
      if (this.chart != null) this.chart.destroy();
    }
  },

  updateBackground : function(changeStatusBar) {
    var bodyElement = document.getElementsByTagName('body')[0],
      data = appData.getLastWeather()[0],
      currentTime = Date.now(),
      sunrise = new Date(data.sys.sunrise * 1000),
      sunset = new Date(data.sys.sunset * 1000);
    if (currentTime >= sunrise && currentTime < sunset) {
      bodyElement.classList.remove('night');
      bodyElement.classList.add('day');
      if (changeStatusBar) this.updateStatusBar("#419BD3");
    }
    else {
      bodyElement.classList.remove('day');
      bodyElement.classList.add('night');
      if (changeStatusBar) this.updateStatusBar("#7979C1");
    }
  },

  updateStatusBar : function(hexColor) {
    if (cordova.platformId != 'android') {
      StatusBar.backgroundColorByHexString(hexColor);
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
    var ampm = 'AM',
    tIndex = 4;
    time = time.split(' '); // split date/time into array
    if (excludeYear) {
       time.splice(3, 1); // remove year if desired
       tIndex--; // change index since array is smaller now
    }
    time[tIndex] = time[tIndex].split(':'); // split time into array
    time[tIndex].pop(); // Remove seconds
    if (parseInt(time[tIndex][0]) >= 12) ampm = 'PM'; // check if am/pm
    // If hour is 0, add 12
    if (parseInt(time[tIndex][0]) == 0 ) time[tIndex][0] = parseInt(time[tIndex][0]) + 12;
    // remove preceding 0 if only 1 digit
    if (parseInt(time[tIndex][0]) < 10 && ampm == 'AM') time[tIndex][0] = time[tIndex][0].substring(1);
    // subtract 12 hours if > 12
    if (parseInt(time[tIndex][0]) > 12 && ampm == 'PM') time[tIndex][0] = parseInt(time[tIndex][0]) - 12;
    time[tIndex] = time[tIndex].join(':'); // combine hours & minutes
    time = time.join(' ') + " " + ampm; // combine into date/time and add am/pm
    return time;
  },

  updateUI : function(data, time) {
    // data is array [0] current weather [1] future weather
    this.updateTime(time);
    this.updateLocation(data[0].name, data[0].sys.country);
    this.updateFutureWeather(data[1]);
    this.chartMethods.initializeChart(data[1]);
    // Update the background if setting allows 
    // find sunrise and sunset values for background changes
    // unix timestamp * 1000 for epoch date
    if (userSettings.backgroundChanges) this.updateBackground(true);
    this.updateWeatherData(data[0]);
    this.drawSunriseSunset(); // Data retrieved in function due to called on resize event
    this.updateCloudCover(data[0]);
    this.updateWind(data[0]);
    this.updateHumidityPressure(data[0]);
    this.updateDaySummary(data[1], 3);
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