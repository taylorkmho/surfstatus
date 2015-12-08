var express        = require('express');
var request        = require('request');
var async          = require('async');
var parseXML       = require('xml2js').parseString;

var router         = express.Router();

var secrets        = require('../data/secrets.json');

router.get('/', function(req, res, next) {

  var surfHeightRanges = new Array();
  var weather = new Array();
  var tides = new Array();

  var weatherAPIKey = secrets[0].apiKeys.openWeatherMap;
  var tideAPIKey    = secrets[0].apiKeys.worldTides;

  function toFeet(meter) {
    return meter * 3.28084;
  }

  var timeNow = Math.floor(Date.now() / 1000);
  var time24HrsAgo = timeNow - 86400;
  console.log('time24HrsAgo ' + time24HrsAgo);
  var tideTimeParams = "&start=" + time24HrsAgo + "&length=172800";

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
            outputRangeSplit['mean'] = (outputRangeSplit['min'] + outputRangeSplit['max']) / 2;
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

          var jsonResponse = JSON.parse(body);
          weather = {
            "temperatureMin" : toFarenheit(jsonResponse.main.temp_min),
            "temperatureMax" : toFarenheit(jsonResponse.main.temp_max),
            "clouds"         : jsonResponse.weather[0].description,
            "windSpeed"      : toMPH(jsonResponse.wind.speed),
            "windDir"        : jsonResponse.wind.deg,
            "windDirComp"    : toCompass(jsonResponse.wind.deg),
            "sunrise"        : toHITime(jsonResponse.sys.sunrise)+'am',
            "sunset"         : toHITime(jsonResponse.sys.sunset)+'pm'
          };
          // console.log(weather);
          callback();

        }
      )
    },
    function(callback) {
      // north
      request(
        { url: "https://www.worldtides.info/api?extremes&lat=21.690596&lon=-158.092333" + tideTimeParams + "&key=" + tideAPIKey, method: "GET", timeout: 10000 },

        function(err, response, body) {

          if (err) {
            res.render('error', {
              message: err.message,
              error: err
            });
          }

          var jsonResponse = JSON.parse(body);

          tides.north = {
            "nowMinus1"   : [ jsonResponse.extremes[0].dt, jsonResponse.extremes[0].type , toFeet( jsonResponse.extremes[0].height ) ],
            "now"         : [ jsonResponse.extremes[1].dt, jsonResponse.extremes[1].type , toFeet( jsonResponse.extremes[1].height ) ],
            "nowPlus1"    : [ jsonResponse.extremes[2].dt, jsonResponse.extremes[2].type , toFeet( jsonResponse.extremes[2].height ) ],
            "nowPlus2"    : [ jsonResponse.extremes[3].dt, jsonResponse.extremes[3].type , toFeet( jsonResponse.extremes[3].height ) ],
            "nowPlus3"    : [ jsonResponse.extremes[4].dt, jsonResponse.extremes[4].type , toFeet( jsonResponse.extremes[4].height ) ],
            "nowPlus4"    : [ jsonResponse.extremes[5].dt, jsonResponse.extremes[5].type , toFeet( jsonResponse.extremes[5].height ) ]
          };

          // console.log('tides.north - \n', tides.north);
          callback();

        }
      )
    },
    function(callback) {
      // west
      request(
        { url: "https://www.worldtides.info/api?extremes&lat=21.412162&lon=-158.269043" + tideTimeParams + "&key=" + tideAPIKey, method: "GET", timeout: 10000 },

        function(err, response, body) {

          if (err) {
            res.render('error', {
              message: err.message,
              error: err
            });
          }

          var jsonResponse = JSON.parse(body);

          tides.west = {
            "nowMinus1"   : [ jsonResponse.extremes[0].dt, jsonResponse.extremes[0].type , toFeet( jsonResponse.extremes[0].height ) ],
            "now"         : [ jsonResponse.extremes[1].dt, jsonResponse.extremes[1].type , toFeet( jsonResponse.extremes[1].height ) ],
            "nowPlus1"    : [ jsonResponse.extremes[2].dt, jsonResponse.extremes[2].type , toFeet( jsonResponse.extremes[2].height ) ],
            "nowPlus2"    : [ jsonResponse.extremes[3].dt, jsonResponse.extremes[3].type , toFeet( jsonResponse.extremes[3].height ) ],
            "nowPlus3"    : [ jsonResponse.extremes[4].dt, jsonResponse.extremes[4].type , toFeet( jsonResponse.extremes[4].height ) ],
            "nowPlus4"    : [ jsonResponse.extremes[5].dt, jsonResponse.extremes[5].type , toFeet( jsonResponse.extremes[5].height ) ]
          };

          // console.log('tides.west - \n', tides.west);
          callback();

        }
      )
    },
    function(callback) {
      // east
      request(
        { url: "https://www.worldtides.info/api?extremes&lat=21.477751&lon=-157.789996" + tideTimeParams + "&key=" + tideAPIKey, method: "GET", timeout: 10000 },

        function(err, response, body) {

          if (err) {
            res.render('error', {
              message: err.message,
              error: err
            });
          }

          var jsonResponse = JSON.parse(body);

          tides.east = {
            "nowMinus1"   : [ jsonResponse.extremes[0].dt, jsonResponse.extremes[0].type , toFeet( jsonResponse.extremes[0].height ) ],
            "now"         : [ jsonResponse.extremes[1].dt, jsonResponse.extremes[1].type , toFeet( jsonResponse.extremes[1].height ) ],
            "nowPlus1"    : [ jsonResponse.extremes[2].dt, jsonResponse.extremes[2].type , toFeet( jsonResponse.extremes[2].height ) ],
            "nowPlus2"    : [ jsonResponse.extremes[3].dt, jsonResponse.extremes[3].type , toFeet( jsonResponse.extremes[3].height ) ],
            "nowPlus3"    : [ jsonResponse.extremes[4].dt, jsonResponse.extremes[4].type , toFeet( jsonResponse.extremes[4].height ) ],
            "nowPlus4"    : [ jsonResponse.extremes[5].dt, jsonResponse.extremes[5].type , toFeet( jsonResponse.extremes[5].height ) ]
          };

          // console.log('tides.east - \n', tides.east);
          callback();

        }
      )
    },
    function(callback) {
      // south
      request(
        { url: "https://www.worldtides.info/api?extremes&lat=21.2749739&lon=-157.8491944&key=" + tideAPIKey, method: "GET", timeout: 10000 },

        function(err, response, body) {

          if (err) {
            res.render('error', {
              message: err.message,
              error: err
            });
          }

          var jsonResponse = JSON.parse(body);

          tides.south = {
            "nowMinus1"   : [ jsonResponse.extremes[0].dt, jsonResponse.extremes[0].type , toFeet( jsonResponse.extremes[0].height ) ],
            "now"         : [ jsonResponse.extremes[1].dt, jsonResponse.extremes[1].type , toFeet( jsonResponse.extremes[1].height ) ],
            "nowPlus1"    : [ jsonResponse.extremes[2].dt, jsonResponse.extremes[2].type , toFeet( jsonResponse.extremes[2].height ) ],
            "nowPlus2"    : [ jsonResponse.extremes[3].dt, jsonResponse.extremes[3].type , toFeet( jsonResponse.extremes[3].height ) ],
            "nowPlus3"    : [ jsonResponse.extremes[4].dt, jsonResponse.extremes[4].type , toFeet( jsonResponse.extremes[4].height ) ],
            "nowPlus4"    : [ jsonResponse.extremes[5].dt, jsonResponse.extremes[5].type , toFeet( jsonResponse.extremes[5].height ) ]
          };
          callback();

        }
      )
    }

    ],
    function(err, results) {
      res.render('index', { title: 'Surf or Nah?', surfHeightRanges: surfHeightRanges, weather: weather, tides: tides });
    }
  );

});

module.exports = router;
