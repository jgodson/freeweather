var config = {
  getOpenWeatherAPIKey : function() {
    return "3140d62a33db8ee204df39d08f9ad09d";
  },

  buildAPIString : function(lat, lng) {
    return "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat +
      "&lon=" + lng + "&appid=" + this.getOpenWeatherAPIKey();
  }
}