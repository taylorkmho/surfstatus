var request        = require('request');
var async          = require('async');
var parseXML       = require('xml2js').parseString;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CronJob = require('cron').CronJob;

var surfSchema = new Schema({
  timestamp: Date,
  north: {
    full: String,
    min: Number,
    max: Number,
    mean: Number
  },
  west: {
    full: String,
    min: Number,
    max: Number,
    mean: Number,
  },
  east: {
    full: String,
    min: Number,
    max: Number,
    mean: Number,
  },
  south: {
    full: String,
    min: Number,
    max: Number,
    mean: Number
  }
});

var SurfReport = mongoose.model('SurfData', surfSchema);

var job = new CronJob({
  cronTime: '00 * * * * *',
  onTick: function() {

    var surfHeightRanges = new Array();

    async.parallel([
      function(callback) {
        request(
          { url: "http://www.prh.noaa.gov/hnl/xml/Surf.xml", method: "GET", timeout: 10000 },

          function(err, response, body) {
            if (err) {
              console.log(err);
              return;
            }
            var surfForecast = "";

            parseXML(body, function(err, result) {
              // dear people of NOAA, please don't ever change your RSS format
              surfForecast = result['rss']['channel'][0]['item'][1]['description'][0];
              // amen
            });
            var hawaiianScale = 2;
            // console.log(surfForecast);
            var surfForecastDirections = surfForecast.split('\n');
            for (var i = 0; i < surfForecastDirections.length; i++) {
              var regExRange = /[0-9]+\s(to)\s[0-9]+/g;
              var outputRange = regExRange.exec(surfForecastDirections[i])[0];
              var outputRangeSplit = outputRange.split(' to ');

              outputRangeSplit['min'] = Math.round(outputRangeSplit[0] / hawaiianScale);
              outputRangeSplit['max'] = Math.round(outputRangeSplit[1] / hawaiianScale);
              outputRangeSplit['mean'] = (outputRangeSplit['min'] + outputRangeSplit['max']) / 2;

              surfHeightRanges.push({
                full: surfForecastDirections[i],
                min: outputRangeSplit['min'],
                max: outputRangeSplit['max'],
                mean: outputRangeSplit['mean']
              });
            }
            callback();

          }
        )
      }],
      function(err, results) {
        if (!err) {

          var newSurfReport = new SurfReport({
            timestamp: new Date(),
            north: {
              full: surfHeightRanges[0].full,
              min: surfHeightRanges[0].min,
              max: surfHeightRanges[0].max,
              mean: surfHeightRanges[0].mean
            },
            west: {
              full: surfHeightRanges[1].full,
              min: surfHeightRanges[1].min,
              max: surfHeightRanges[1].max,
              mean: surfHeightRanges[1].mean
            },
            east: {
              full: surfHeightRanges[2].full,
              min: surfHeightRanges[2].min,
              max: surfHeightRanges[2].max,
              mean: surfHeightRanges[2].mean
            },
            south: {
              full: surfHeightRanges[3].full,
              min: surfHeightRanges[3].min,
              max: surfHeightRanges[3].max,
              mean: surfHeightRanges[3].mean
            }
          });

          newSurfReport.save(function(err){
            if (err) return handleError(err);
            console.log('saved new surf height');
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