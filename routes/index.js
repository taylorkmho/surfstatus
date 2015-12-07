var express        = require('express');
var request        = require('request');
var async          = require('async');
var parseXML       = require('xml2js').parseString;

var router         = express.Router();

var secrets        = require('../data/secrets.json');

router.get('/', function(req, res, next) {

  var swellInfo = new Array();
  var surfHeightRanges = new Array();
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
            console.log('outputRangeSplit ' + outputRangeSplit);
            surfHeightRanges.push(outputRangeSplit);
          }
          callback();

        }
      )
    }],
    function(err, results) {
      res.render('index', { title: 'Surf or Nah?', surfHeightRanges: surfHeightRanges, swellInfo: swellInfo });
    }
  );

});

module.exports = router;
