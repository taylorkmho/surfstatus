var express        = require('express');
var request        = require('request');
var async          = require('async');
var parseXML       = require('xml2js').parseString;

var router         = express.Router();

var secrets        = require('../data/secrets.json');

router.get('/', function(req, res, next) {

  var swellInfo = new Array();
  var surfHeightRanges = new Array();

  var weatherAPIKey = secrets[0].apiKeys.openWeatherMap;

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

  function toHITime(timestamp) {
    var date = new Date(timestamp*1000);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if ( hours > 12 ) { hours = hours - 12 };
    return hours + ':' + minutes;
  }

  async.parallel([
    function(callback) {
      request(
        { url: "http://www.prh.noaa.gov/hnl/xml/Surf.xml", method: "GET", timeout: 10000 },

        function(err, response, body) {

          if (err) {
            res.render('error', {
              message: err.message,
              error: err
            });
          }

          var surfForecast = "";
          parseXML(body, function(err, result) {
            // dear people of NOAA, please don't ever change your RSS format
            surfForecast = result['rss']['channel'][0]['item'][1]['description'][0];
            // amen
          });
          var hawaiianScale = 2;
          var surfForecastDirections = surfForecast.split('\n');
          for (var i = 0; i < surfForecastDirections.length; i++) {
            var regExRange = /[0-9]+\s(to)\s[0-9]+/g;
            var outputRange = regExRange.exec(surfForecastDirections[i])[0];
            var outputRangeSplit = outputRange.split(' to ');
            outputRangeSplit['min'] = Math.round(outputRangeSplit[0] / hawaiianScale);
            outputRangeSplit['max'] = Math.round(outputRangeSplit[1] / hawaiianScale);
            outputRangeSplit['mean'] = (outputRangeSplit['min'] + outputRangeSplit['max'] / 2);
            // console.log('outputRangeSplit ' + outputRangeSplit);
            surfHeightRanges.push(outputRangeSplit);
          }
          callback();

        }
      )
    },
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
          var weather = {
            "temperatureMin" : toFarenheit(jsonResponse.main.temp_min),
            "temperatureMax" : toFarenheit(jsonResponse.main.temp_max),
            "clouds"         : jsonResponse.weather[0].description,
            "windSpeed"      : toMPH(jsonResponse.wind.speed),
            "windDir"        : jsonResponse.wind.deg,
            "windDirComp"    : toCompass(jsonResponse.wind.deg),
            "sunrise"        : toHITime(jsonResponse.sys.sunrise),
            "sunset"         : toHITime(jsonResponse.sys.sunset)
          };
          console.log(weather);
          callback();

        }
      )
    }

    ],
    function(err, results) {
      res.render('index', { title: 'Surf or Nah?', surfHeightRanges: surfHeightRanges, swellInfo: swellInfo });
    }
  );

});

module.exports = router;
