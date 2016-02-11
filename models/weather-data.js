var request        = require('request');
var async          = require('async');
var parseXML       = require('xml2js').parseString;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CronJob = require('cron').CronJob;

var weatherAPIKey = process.env.KEY_OPENWEATHERMAP;

var weatherSchema = new Schema({
  timestamp: Date,
  temperature: Number,
  temperatureMin: Number,
  temperatureMax: Number,
  description: String,
  windSpeed: Number,
  windDir: Number,
  windDirComp: String,
  sunrise: String,
  sunset: String
});

var WeatherData = mongoose.model('WeatherData', weatherSchema);

var job = new CronJob({
  cronTime: '00 00 * * * *',
  onTick: function() {

    function toHITime(timestamp) {
      var date = new Date(timestamp*1000);
      var hours = date.getHours();
      var minutes = (date.getMinutes()<10?'0':'') + date.getMinutes();
      if ( hours > 12 ) { hours = hours - 12 };
      return hours + ':' + minutes;
    }

    function toFeet(meter) {
      return meter * 3.28084;
    }

    function toFarenheit(kelvin) {
      return Math.round(kelvin * (9/5) - 459.67);
    }

    function toMPH(mps) {
      return Math.round( (mps * 2.2369362920544) * 2 ) / 2;
    }

    function toCompass(deg) {
      while ( deg < 0 ) deg += 360;
      while ( deg >= 360 ) deg -= 360;
      var val = Math.round( (deg -11.25 ) / 22.5 );
      var arr = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
      return arr[ Math.abs(val) ];
    }

    var weather = new Array();

    async.parallel([
      function(callback) {
        // honolulu weather
        request(
          { url: "http://api.openweathermap.org/data/2.5/weather?id=5856195&appid=" + weatherAPIKey, method: "GET", timeout: 10000 },

          function(err, response, body) {

            if (err) {
              res.render('error', {
                message: err.message,
                error: err
              });
            }

            var jsonResponse = JSON.parse(body);
            var weatherSimpleDescription = "";
            if (jsonResponse.weather[0].icon === "02n") {
              weatherSimpleDescription = "Light Clouds";
            } else if (jsonResponse.weather[0].icon === "03n"  || jsonResponse.weather[0].icon === "04n" ) {
              weatherSimpleDescription = "Cloudy";
            } else if (jsonResponse.weather[0].icon === "09n") {
              weatherSimpleDescription = "Light Rain";
            } else if (jsonResponse.weather[0].icon === "10n") {
              weatherSimpleDescription = "Rain";
            } else if (jsonResponse.weather[0].icon === "11n") {
              weatherSimpleDescription = "Thunderstorms";
            } else {
              weatherSimpleDescription = "Clear";
            }

            weather = {
              "temperature" : toFarenheit(jsonResponse.main.temp),
              "temperatureMin" : toFarenheit(jsonResponse.main.temp_min),
              "temperatureMax" : toFarenheit(jsonResponse.main.temp_max),
              "description"    : weatherSimpleDescription,
              "windSpeed"      : toMPH(jsonResponse.wind.speed),
              "windDir"        : jsonResponse.wind.deg,
              "windDirComp"    : toCompass(jsonResponse.wind.deg),
              "sunrise"        : toHITime(jsonResponse.sys.sunrise)+'am',
              "sunset"         : toHITime(jsonResponse.sys.sunset)+'pm'
            };
            callback();

          }
        )
      }],
      function(err, results) {
        if (!err) {

          console.log(weather);

          var newWeatherData = new WeatherData({
            timestamp: new Date(),
            temperature: weather.temperature,
            temperatureMin: weather.temperatureMin,
            temperatureMax: weather.temperatureMax,
            description: weather.description,
            windSpeed: weather.windSpeed,
            windDir: weather.windDir,
            windDirComp: weather.windDirComp,
            sunrise: weather.sunrise,
            sunset: weather.sunset
          });
          newWeatherData.save(function(err){
            if (err) return handleError(err);
            console.log('saved new weather data');
          })

        } else {
          console.log('error: '+ err.message);
        }

      });

  },
  start: true,
  timeZone: 'Pacific/Honolulu'
});
job.start();

module.exports = weatherSchema;