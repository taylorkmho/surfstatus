var request        = require('request');
var async          = require('async');
var parseXML       = require('xml2js').parseString;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CronJob = require('cron').CronJob;

var secrets        = require('../data/secrets.json');
var tideAPIKey    = secrets[0].apiKeys.worldTides;

var tideSchema = new Schema({
  timestamp: Date,
  north: {
    nowMinus1: Array,
    now: Array,
    nowPlus1: Array,
    nowPlus2: Array,
    nowPlus3: Array,
    nowPlus4: Array
  },
  west: {
    nowMinus1: Array,
    now: Array,
    nowPlus1: Array,
    nowPlus2: Array,
    nowPlus3: Array,
    nowPlus4: Array
  },
  east: {
    nowMinus1: Array,
    now: Array,
    nowPlus1: Array,
    nowPlus2: Array,
    nowPlus3: Array,
    nowPlus4: Array
  },
  south: {
    nowMinus1: Array,
    now: Array,
    nowPlus1: Array,
    nowPlus2: Array,
    nowPlus3: Array,
    nowPlus4: Array
  }
});

var TideData = mongoose.model('TideData', tideSchema);

var job = new CronJob({
  cronTime: '00 00 00 * * *',
  onTick: function() {

    function toFeet(meter) {
      return meter * 3.28084;
    }

    function toHITime(timestamp) {
      var date = new Date(timestamp*1000);
      var hours = date.getHours();
      var minutes = (date.getMinutes()<10?'0':'') + date.getMinutes();
      var amPM = "am"
      if ( hours > 12 ) {
        hours = hours - 12
        amPM = "pm";
      };
      return hours + ':' + minutes + amPM;
    }

    var timeNow = Math.floor(Date.now() / 1000);
    var time24HrsAgo = timeNow - 86400;

    var tideTimeParams = "&start=" + time24HrsAgo + "&length=172800";

    var tides = new Array();

    async.parallel([
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
              "nowMinus1"   : [ toHITime(jsonResponse.extremes[0].dt), jsonResponse.extremes[0].type , toFeet( jsonResponse.extremes[0].height ) ],
              "now"         : [ toHITime(jsonResponse.extremes[1].dt), jsonResponse.extremes[1].type , toFeet( jsonResponse.extremes[1].height ) ],
              "nowPlus1"    : [ toHITime(jsonResponse.extremes[2].dt), jsonResponse.extremes[2].type , toFeet( jsonResponse.extremes[2].height ) ],
              "nowPlus2"    : [ toHITime(jsonResponse.extremes[3].dt), jsonResponse.extremes[3].type , toFeet( jsonResponse.extremes[3].height ) ],
              "nowPlus3"    : [ toHITime(jsonResponse.extremes[4].dt), jsonResponse.extremes[4].type , toFeet( jsonResponse.extremes[4].height ) ],
              "nowPlus4"    : [ toHITime(jsonResponse.extremes[5].dt), jsonResponse.extremes[5].type , toFeet( jsonResponse.extremes[5].height ) ]
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
              "nowMinus1"   : [ toHITime(jsonResponse.extremes[0].dt), jsonResponse.extremes[0].type , toFeet( jsonResponse.extremes[0].height ) ],
              "now"         : [ toHITime(jsonResponse.extremes[1].dt), jsonResponse.extremes[1].type , toFeet( jsonResponse.extremes[1].height ) ],
              "nowPlus1"    : [ toHITime(jsonResponse.extremes[2].dt), jsonResponse.extremes[2].type , toFeet( jsonResponse.extremes[2].height ) ],
              "nowPlus2"    : [ toHITime(jsonResponse.extremes[3].dt), jsonResponse.extremes[3].type , toFeet( jsonResponse.extremes[3].height ) ],
              "nowPlus3"    : [ toHITime(jsonResponse.extremes[4].dt), jsonResponse.extremes[4].type , toFeet( jsonResponse.extremes[4].height ) ],
              "nowPlus4"    : [ toHITime(jsonResponse.extremes[5].dt), jsonResponse.extremes[5].type , toFeet( jsonResponse.extremes[5].height ) ]
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
              "nowMinus1"   : [ toHITime(jsonResponse.extremes[0].dt), jsonResponse.extremes[0].type , toFeet( jsonResponse.extremes[0].height ) ],
              "now"         : [ toHITime(jsonResponse.extremes[1].dt), jsonResponse.extremes[1].type , toFeet( jsonResponse.extremes[1].height ) ],
              "nowPlus1"    : [ toHITime(jsonResponse.extremes[2].dt), jsonResponse.extremes[2].type , toFeet( jsonResponse.extremes[2].height ) ],
              "nowPlus2"    : [ toHITime(jsonResponse.extremes[3].dt), jsonResponse.extremes[3].type , toFeet( jsonResponse.extremes[3].height ) ],
              "nowPlus3"    : [ toHITime(jsonResponse.extremes[4].dt), jsonResponse.extremes[4].type , toFeet( jsonResponse.extremes[4].height ) ],
              "nowPlus4"    : [ toHITime(jsonResponse.extremes[5].dt), jsonResponse.extremes[5].type , toFeet( jsonResponse.extremes[5].height ) ]
            };

            // console.log('tides.east - \n', tides.east);
            callback();

          }
        )
      },
      function(callback) {
        // south
        request(
          { url: "https://www.worldtides.info/api?extremes&lat=21.2749739&lon=-157.8491944" + tideTimeParams + "&key=" + tideAPIKey, method: "GET", timeout: 10000 },

          function(err, response, body) {

            if (err) {
              res.render('error', {
                message: err.message,
                error: err
              });
            }

            var jsonResponse = JSON.parse(body);

            tides.south = {
              "nowMinus1"   : [ toHITime(jsonResponse.extremes[0].dt), jsonResponse.extremes[0].type , toFeet( jsonResponse.extremes[0].height ) ],
              "now"         : [ toHITime(jsonResponse.extremes[1].dt), jsonResponse.extremes[1].type , toFeet( jsonResponse.extremes[1].height ) ],
              "nowPlus1"    : [ toHITime(jsonResponse.extremes[2].dt), jsonResponse.extremes[2].type , toFeet( jsonResponse.extremes[2].height ) ],
              "nowPlus2"    : [ toHITime(jsonResponse.extremes[3].dt), jsonResponse.extremes[3].type , toFeet( jsonResponse.extremes[3].height ) ],
              "nowPlus3"    : [ toHITime(jsonResponse.extremes[4].dt), jsonResponse.extremes[4].type , toFeet( jsonResponse.extremes[4].height ) ],
              "nowPlus4"    : [ toHITime(jsonResponse.extremes[5].dt), jsonResponse.extremes[5].type , toFeet( jsonResponse.extremes[5].height ) ]
            };
            callback();

          }
        )
      }

      ],
      function(err, results) {
        if (!err) {
          var newTideData = new TideData({
            timestamp: new Date(),
            north: {
              nowMinus1: tides['north']['nowMinus1'],
              now: tides['north']['now'],
              nowPlus1: tides['north']['nowPlus1'],
              nowPlus2: tides['north']['nowPlus2'],
              nowPlus3: tides['north']['nowPlus3'],
              nowPlus4: tides['north']['nowPlus4']
            },
            west: {
              nowMinus1: tides['west']['nowMinus1'],
              now: tides['west']['now'],
              nowPlus1: tides['west']['nowPlus1'],
              nowPlus2: tides['west']['nowPlus2'],
              nowPlus3: tides['west']['nowPlus3'],
              nowPlus4: tides['west']['nowPlus4']
            },
            east: {
              nowMinus1: tides['east']['nowMinus1'],
              now: tides['east']['now'],
              nowPlus1: tides['east']['nowPlus1'],
              nowPlus2: tides['east']['nowPlus2'],
              nowPlus3: tides['east']['nowPlus3'],
              nowPlus4: tides['east']['nowPlus4']
            },
            south: {
              nowMinus1: tides['south']['nowMinus1'],
              now: tides['south']['now'],
              nowPlus1: tides['south']['nowPlus1'],
              nowPlus2: tides['south']['nowPlus2'],
              nowPlus3: tides['south']['nowPlus3'],
              nowPlus4: tides['south']['nowPlus4']
            }
          });
          newTideData.save(function(err){
            if (err) return console.log(err);
            console.log('saved new tide data');
          })

        } else {
          console.log('error: '+ err.message);
        }
      }
    );

  },
  start: true,
  timeZone: 'Pacific/Honolulu'
});
job.start();

module.exports = tideSchema;