var request        = require('request');
var async          = require('async');
var parseXML       = require('xml2js').parseString;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CronJob = require('cron').CronJob;

var tideAPIClientID      = process.env.KEY_ID_AERIS;
var tideAPIClientSecret  = process.env.KEY_SECRET_AERIS;

var tideSchema = new Schema({
  publishedAt: Date,
  north: {
    0: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    1: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    2: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    3: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    }
  },
  west: {
    0: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    1: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    2: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    3: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    }
  },
  east: {
    0: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    1: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    2: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    3: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    }
  },
  south: {
    0: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    1: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    2: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    3: {
      timestamp: Date,
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    }
  }
});

var TideData = mongoose.model('TideData', tideSchema);

var job = new CronJob({
  cronTime: process.env.CRONTIME_SETAS ? process.env.CRONTIME_DEBUG : '00 00 00 * * *',
  onTick: function() {

    function getTime(timestamp) {
      var date = new Date(timestamp*1000);
      var hours = ((date.getHours() + 11) % 12) + 1;
      var minutes = (date.getMinutes()<10?'0':'') + date.getMinutes();
      var amPm = date.getHours() > 11 ? 'pm' : 'am';
      return hours + ':' + minutes + amPm;
    }

    function getDate(timestamp) {
      var date = new Date(timestamp*1000);
      var month = date.getMonth() + 1;
      var day = date.getDate();
      return month + '/' + day;
    }

    function tideTypeVerbose(type) {
      if (type === "l") {
        return "low";
      } else if (type === "h") {
        return "high";
      }
    }

    var now = new Date();
    var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var timestamp = startOfDay / 1000;

    var tideTimeParams = '&from=yesterday';

    var tides = new Array();

    async.parallel([
      function(callback) {
        // north
        request(
          { url: 'http://api.aerisapi.com/tides/closest?p=21.690596,-158.092333&limit=1' + tideTimeParams + '&client_id=' + tideAPIClientID + '&client_secret=' + tideAPIClientSecret, method: "GET", timeout: 10000 },

          function(err, response, body) {

            if (err) {
              res.render('error', {
                message: err.message,
                error: err
              });
            }

            var jsonResponse = JSON.parse(body);
            // console.log(jsonResponse.response[0].periods);

            tides.north = {
              0 : {
                timestamp: jsonResponse.response[0].periods[0].timestamp,
                date: getDate(jsonResponse.response[0].periods[0].timestamp),
                time: getTime(jsonResponse.response[0].periods[0].timestamp),
                tideHeight: jsonResponse.response[0].periods[0].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[0].type)
              },
              1 : {
                timestamp: jsonResponse.response[0].periods[1].timestamp,
                date: getDate(jsonResponse.response[0].periods[1].timestamp),
                time: getTime(jsonResponse.response[0].periods[1].timestamp),
                tideHeight: jsonResponse.response[0].periods[1].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[1].type)
              },
              2 : {
                timestamp: jsonResponse.response[0].periods[2].timestamp,
                date: getDate(jsonResponse.response[0].periods[2].timestamp),
                time: getTime(jsonResponse.response[0].periods[2].timestamp),
                tideHeight: jsonResponse.response[0].periods[2].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[2].type)
              },
              3 : {
                timestamp: jsonResponse.response[0].periods[3].timestamp,
                date: getDate(jsonResponse.response[0].periods[3].timestamp),
                time: getTime(jsonResponse.response[0].periods[3].timestamp),
                tideHeight: jsonResponse.response[0].periods[3].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[3].type)
              }
            };

            console.log('tides.north - \n', tides.north);
            callback();

          }
        )
      },
      function(callback) {
        // west
        request(
          { url: 'http://api.aerisapi.com/tides/closest?p=21.412162,-158.269043&limit=1' + tideTimeParams + '&client_id=' + tideAPIClientID + '&client_secret=' + tideAPIClientSecret, method: "GET", timeout: 10000 },

          function(err, response, body) {

            if (err) {
              res.render('error', {
                message: err.message,
                error: err
              });
            }

            var jsonResponse = JSON.parse(body);

            tides.west = {
              0 : {
                timestamp: jsonResponse.response[0].periods[0].timestamp,
                date: getDate(jsonResponse.response[0].periods[0].timestamp),
                time: getTime(jsonResponse.response[0].periods[0].timestamp),
                tideHeight: jsonResponse.response[0].periods[0].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[0].type)
              },
              1 : {
                timestamp: jsonResponse.response[0].periods[1].timestamp,
                date: getDate(jsonResponse.response[0].periods[1].timestamp),
                time: getTime(jsonResponse.response[0].periods[1].timestamp),
                tideHeight: jsonResponse.response[0].periods[1].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[1].type)
              },
              2 : {
                timestamp: jsonResponse.response[0].periods[2].timestamp,
                date: getDate(jsonResponse.response[0].periods[2].timestamp),
                time: getTime(jsonResponse.response[0].periods[2].timestamp),
                tideHeight: jsonResponse.response[0].periods[2].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[2].type)
              },
              3 : {
                timestamp: jsonResponse.response[0].periods[3].timestamp,
                date: getDate(jsonResponse.response[0].periods[3].timestamp),
                time: getTime(jsonResponse.response[0].periods[3].timestamp),
                tideHeight: jsonResponse.response[0].periods[3].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[3].type)
              }
            };

            // console.log('tides.west - \n', tides.west);
            callback();

          }
        )
      },
      function(callback) {
        // east
        request(
          { url: 'http://api.aerisapi.com/tides/closest?p=21.477751,-157.789996&limit=1' + tideTimeParams + '&client_id=' + tideAPIClientID + '&client_secret=' + tideAPIClientSecret, method: "GET", timeout: 10000 },
          function(err, response, body) {

            if (err) {
              res.render('error', {
                message: err.message,
                error: err
              });
            }

            var jsonResponse = JSON.parse(body);

            tides.east = {
              0 : {
                timestamp: jsonResponse.response[0].periods[0].timestamp,
                date: getDate(jsonResponse.response[0].periods[0].timestamp),
                time: getTime(jsonResponse.response[0].periods[0].timestamp),
                tideHeight: jsonResponse.response[0].periods[0].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[0].type)
              },
              1 : {
                timestamp: jsonResponse.response[0].periods[1].timestamp,
                date: getDate(jsonResponse.response[0].periods[1].timestamp),
                time: getTime(jsonResponse.response[0].periods[1].timestamp),
                tideHeight: jsonResponse.response[0].periods[1].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[1].type)
              },
              2 : {
                timestamp: jsonResponse.response[0].periods[2].timestamp,
                date: getDate(jsonResponse.response[0].periods[2].timestamp),
                time: getTime(jsonResponse.response[0].periods[2].timestamp),
                tideHeight: jsonResponse.response[0].periods[2].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[2].type)
              },
              3 : {
                timestamp: jsonResponse.response[0].periods[3].timestamp,
                date: getDate(jsonResponse.response[0].periods[3].timestamp),
                time: getTime(jsonResponse.response[0].periods[3].timestamp),
                tideHeight: jsonResponse.response[0].periods[3].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[3].type)
              }
            };

            // console.log('tides.east - \n', tides.east);
            callback();

          }
        )
      },
      function(callback) {
        // south
        request(
          { url: 'http://api.aerisapi.com/tides/closest?p=21.2749739,-157.8491944&limit=1' + tideTimeParams + '&client_id=' + tideAPIClientID + '&client_secret=' + tideAPIClientSecret, method: "GET", timeout: 10000 },

          function(err, response, body) {

            if (err) {
              res.render('error', {
                message: err.message,
                error: err
              });
            }

            var jsonResponse = JSON.parse(body);

            tides.south = {
              0 : {
                timestamp: jsonResponse.response[0].periods[0].timestamp,
                date: getDate(jsonResponse.response[0].periods[0].timestamp),
                time: getTime(jsonResponse.response[0].periods[0].timestamp),
                tideHeight: jsonResponse.response[0].periods[0].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[0].type)
              },
              1 : {
                timestamp: jsonResponse.response[0].periods[1].timestamp,
                date: getDate(jsonResponse.response[0].periods[1].timestamp),
                time: getTime(jsonResponse.response[0].periods[1].timestamp),
                tideHeight: jsonResponse.response[0].periods[1].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[1].type)
              },
              2 : {
                timestamp: jsonResponse.response[0].periods[2].timestamp,
                date: getDate(jsonResponse.response[0].periods[2].timestamp),
                time: getTime(jsonResponse.response[0].periods[2].timestamp),
                tideHeight: jsonResponse.response[0].periods[2].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[2].type)
              },
              3 : {
                timestamp: jsonResponse.response[0].periods[3].timestamp,
                date: getDate(jsonResponse.response[0].periods[3].timestamp),
                time: getTime(jsonResponse.response[0].periods[3].timestamp),
                tideHeight: jsonResponse.response[0].periods[3].heightFT,
                tideDesc: tideTypeVerbose(jsonResponse.response[0].periods[3].type)
              }
            };

            // console.log('tides.south - \n', tides.south);
            callback();

          }
        )
      }

      ],
      function(err, results) {
        if (!err) {
          var newTideData = new TideData({
            timestamp: new Date(),
            north: tides.north,
            west: tides.west,
            east: tides.east,
            south: tides.south
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