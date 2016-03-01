var request        = require('request');
var async          = require('async');
var parseXML       = require('xml2js').parseString;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CronJob = require('cron').CronJob;

var tideAPIKey     = process.env.KEY_WORLDTIDES;

var tideSchema = new Schema({
  timestamp: Date,
  north: {
    0: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    1: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    2: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    3: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    }
  },
  west: {
    0: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    1: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    2: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    3: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    }
  },
  east: {
    0: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    1: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    2: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    3: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    }
  },
  south: {
    0: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    1: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    2: {
      date: String,
      time: String,
      tideHeight: String,
      tideDesc: String
    },
    3: {
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

    function toFeet(meter) {
      return meter * 3.28084;
    }

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

    var now = new Date();
    var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var timestamp = startOfDay / 1000;

    var tideTimeParams = "&start=" + timestamp + "&length=172800";

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
              0 : {
                date: getDate(jsonResponse.extremes[0].dt),
                time: getTime(jsonResponse.extremes[0].dt),
                tideHeight: toFeet(jsonResponse.extremes[0].height),
                tideDesc: jsonResponse.extremes[0].type
              },
              1 : {
                date: getDate(jsonResponse.extremes[1].dt),
                time: getTime(jsonResponse.extremes[1].dt),
                tideHeight: toFeet(jsonResponse.extremes[1].height),
                tideDesc: jsonResponse.extremes[1].type
              },
              2 : {
                date: getDate(jsonResponse.extremes[2].dt),
                time: getTime(jsonResponse.extremes[2].dt),
                tideHeight: toFeet(jsonResponse.extremes[2].height),
                tideDesc: jsonResponse.extremes[2].type
              },
              3 : {
                date: getDate(jsonResponse.extremes[3].dt),
                time: getTime(jsonResponse.extremes[3].dt),
                tideHeight: toFeet(jsonResponse.extremes[3].height),
                tideDesc: jsonResponse.extremes[3].type
              }
            };

            // console.log('tides.north - \n', tides.north);
            callback();

          }
        )
      }
      // },
      // function(callback) {
      //   // west
      //   request(
      //     { url: "https://www.worldtides.info/api?extremes&lat=21.412162&lon=-158.269043" + tideTimeParams + "&key=" + tideAPIKey, method: "GET", timeout: 10000 },

      //     function(err, response, body) {

      //       if (err) {
      //         res.render('error', {
      //           message: err.message,
      //           error: err
      //         });
      //       }

      //       var jsonResponse = JSON.parse(body);

      //       tides.west = {
      //         0 : {
      //           date: getDate(jsonResponse.extremes[0].dt),
      //           time: getTime(jsonResponse.extremes[0].dt),
      //           tideHeight: toFeet(jsonResponse.extremes[0].height),
      //           tideDesc: jsonResponse.extremes[0].type
      //         },
      //         1 : {
      //           date: getDate(jsonResponse.extremes[1].dt),
      //           time: getTime(jsonResponse.extremes[1].dt),
      //           tideHeight: toFeet(jsonResponse.extremes[1].height),
      //           tideDesc: jsonResponse.extremes[1].type
      //         },
      //         2 : {
      //           date: getDate(jsonResponse.extremes[2].dt),
      //           time: getTime(jsonResponse.extremes[2].dt),
      //           tideHeight: toFeet(jsonResponse.extremes[2].height),
      //           tideDesc: jsonResponse.extremes[2].type
      //         },
      //         3 : {
      //           date: getDate(jsonResponse.extremes[3].dt),
      //           time: getTime(jsonResponse.extremes[3].dt),
      //           tideHeight: toFeet(jsonResponse.extremes[3].height),
      //           tideDesc: jsonResponse.extremes[3].type
      //         }
      //       };

      //       // console.log('tides.west - \n', tides.west);
      //       callback();

      //     }
      //   )
      // },
      // function(callback) {
      //   // east
      //   request(
      //     { url: "https://www.worldtides.info/api?extremes&lat=21.477751&lon=-157.789996" + tideTimeParams + "&key=" + tideAPIKey, method: "GET", timeout: 10000 },

      //     function(err, response, body) {

      //       if (err) {
      //         res.render('error', {
      //           message: err.message,
      //           error: err
      //         });
      //       }

      //       var jsonResponse = JSON.parse(body);

      //       tides.east = {
      //         0 : {
      //           date: getDate(jsonResponse.extremes[0].dt),
      //           time: getTime(jsonResponse.extremes[0].dt),
      //           tideHeight: toFeet(jsonResponse.extremes[0].height),
      //           tideDesc: jsonResponse.extremes[0].type
      //         },
      //         1 : {
      //           date: getDate(jsonResponse.extremes[1].dt),
      //           time: getTime(jsonResponse.extremes[1].dt),
      //           tideHeight: toFeet(jsonResponse.extremes[1].height),
      //           tideDesc: jsonResponse.extremes[1].type
      //         },
      //         2 : {
      //           date: getDate(jsonResponse.extremes[2].dt),
      //           time: getTime(jsonResponse.extremes[2].dt),
      //           tideHeight: toFeet(jsonResponse.extremes[2].height),
      //           tideDesc: jsonResponse.extremes[2].type
      //         },
      //         3 : {
      //           date: getDate(jsonResponse.extremes[3].dt),
      //           time: getTime(jsonResponse.extremes[3].dt),
      //           tideHeight: toFeet(jsonResponse.extremes[3].height),
      //           tideDesc: jsonResponse.extremes[3].type
      //         }
      //       };

      //       // console.log('tides.east - \n', tides.east);
      //       callback();

      //     }
      //   )
      // },
      // function(callback) {
      //   // south
      //   request(
      //     { url: "https://www.worldtides.info/api?extremes&lat=21.2749739&lon=-157.8491944" + tideTimeParams + "&key=" + tideAPIKey, method: "GET", timeout: 10000 },

      //     function(err, response, body) {

      //       if (err) {
      //         res.render('error', {
      //           message: err.message,
      //           error: err
      //         });
      //       }

      //       var jsonResponse = JSON.parse(body);

      //       tides.south = {
      //         0 : {
      //           date: getDate(jsonResponse.extremes[0].dt),
      //           time: getTime(jsonResponse.extremes[0].dt),
      //           tideHeight: toFeet(jsonResponse.extremes[0].height),
      //           tideDesc: jsonResponse.extremes[0].type
      //         },
      //         1 : {
      //           date: getDate(jsonResponse.extremes[1].dt),
      //           time: getTime(jsonResponse.extremes[1].dt),
      //           tideHeight: toFeet(jsonResponse.extremes[1].height),
      //           tideDesc: jsonResponse.extremes[1].type
      //         },
      //         2 : {
      //           date: getDate(jsonResponse.extremes[2].dt),
      //           time: getTime(jsonResponse.extremes[2].dt),
      //           tideHeight: toFeet(jsonResponse.extremes[2].height),
      //           tideDesc: jsonResponse.extremes[2].type
      //         },
      //         3 : {
      //           date: getDate(jsonResponse.extremes[3].dt),
      //           time: getTime(jsonResponse.extremes[3].dt),
      //           tideHeight: toFeet(jsonResponse.extremes[3].height),
      //           tideDesc: jsonResponse.extremes[3].type
      //         }
      //       };

      //       // console.log('tides.south - \n', tides.south);
      //       callback();

      //     }
      //   )
      // }

      ],
      function(err, results) {
        if (!err) {
          // TODO - fix tide so each location gets unique
          var newTideData = new TideData({
            timestamp: new Date(),
            north: tides.north,
            west: tides.north,
            east: tides.north,
            south: tides.north
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