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

  updateFutureWeather : function(data) {
    var mainElement = document.getElementById('weather-future').children[0];
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
    var date;
    var temp;
    var html = "";
    var previousDay;
    var today;
    var precipitation;
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
        if (date.search(/(\d[0,1]|\s9):[0-9][0-9] PM/) > -1) { // If 9PM or later, is for tomorrow
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
    this.chartMethods.clearChart();
    this.chartMethods.drawHourlyChart(chartData);
    mainElement.innerHTML = html;
  },

  chartMethods : {
    chart : null,
    drawHourlyChart : function(hourlyData) {
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
            text : "Five Day Trend",
            fontSize : 18,
            padding : 20
          },
          tooltips : {
            mode : 'label'
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

    clearChart : function() {
      if (this.chart != null) this.chart.destroy();
    }
  },

  updateBackground : function(changeStatusBar, sunrise, sunset) {
    var bodyElement = document.getElementsByTagName('body')[0];
    var currentHour = new Date().getHours();
    if (currentHour >= sunrise && currentHour < sunset) {
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
    // find sunrise and sunset values for background changes
    // unix timestamp * 1000 for epoch date
    var sunrise = new Date(data[0].sys.sunrise * 1000).getHours();
    var sunset = new Date(data[0].sys.sunset * 1000).getHours();
    if (userSettings.backgroundChanges) this.updateBackground(true, sunrise, sunset);
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