var request        = require('request');
var async          = require('async');
var parseXML       = require('xml2js').parseString;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CronJob = require('cron').CronJob;

var surfReportSchema = new Schema({
  timestamp: Date,
  fullNorth: String,
  minNorth: Number,
  maxNorth: Number,
  meanNorth: Number,
  fullWest: String,
  minWest: Number,
  maxWest: Number,
  meanWest: Number,
  fullEast: String,
  minEast: Number,
  maxEast: Number,
  meanEast: Number,
  fullSouth: String,
  minSouth: Number,
  maxSouth: Number,
  meanSouth: Number
});

var SurfReport = mongoose.model('SurfData', surfReportSchema);

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
            console.log('after error')
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

          console.log('--surfHeightRanges ', surfHeightRanges);

          var newSurfReport = new SurfReport({
            timestamp: new Date(),
            fullNorth: surfHeightRanges[0].full,
            minNorth: surfHeightRanges[0].min,
            maxNorth: surfHeightRanges[0].max,
            meanNorth: surfHeightRanges[0].mean,
            fullWest: surfHeightRanges[1].full,
            minWest: surfHeightRanges[1].min,
            maxWest: surfHeightRanges[1].max,
            meanWest: surfHeightRanges[1].mean,
            fullEast: surfHeightRanges[2].full,
            minEast: surfHeightRanges[2].min,
            maxEast: surfHeightRanges[2].max,
            meanEast: surfHeightRanges[2].mean,
            fullSouth: surfHeightRanges[3].full,
            minSouth: surfHeightRanges[3].min,
            maxSouth: surfHeightRanges[3].max,
            meanSouth: surfHeightRanges[3].mean
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