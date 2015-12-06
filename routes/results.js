var express        = require('express');
var request        = require('request');
var async          = require('async');
var router         = express.Router();

var surfbreaksList = require('../data/surfbreaks.json');
var secrets        = require('../data/secrets.json');

/* GET users listing. */
router.get('/', function(req, res, next) {

  /*
    MAGIC SEAWEED ACTION
  */
  var magicSWKey = secrets[0].apiKeys.magicSW;
  // // console.log(magicSWKey);
  var swellInfo = new Array();
  // console.log(breaksBasedOnQueries);
  async.each(
    surfbreaksList,
    function(resultSurfbreak, callback) {

      request(
        { url: "http://magicseaweed.com/api/" + magicSWKey+ "/forecast/?spot_id=" + resultSurfbreak.magicSW, method: "GET", timeout: 10000 },
        function(error, response, body) {
          // needs error handler

          var breakArray = JSON.parse(body);

          var surfbreakInfoSuccess = true;
          var minArray = [breakArray[0].swell.minBreakingHeight, breakArray[1].swell.minBreakingHeight, breakArray[2].swell.minBreakingHeight, breakArray[3].swell.minBreakingHeight, breakArray[4].swell.minBreakingHeight, breakArray[5].swell.minBreakingHeight];
          var maxArray = [breakArray[0].swell.absMaxBreakingHeight, breakArray[1].swell.absMaxBreakingHeight, breakArray[2].swell.absMaxBreakingHeight, breakArray[3].swell.absMaxBreakingHeight, breakArray[4].swell.absMaxBreakingHeight, breakArray[5].swell.absMaxBreakingHeight];
          var largestMinHeight = 0,
              largestMinHeightIndex = 0;
          for (var i = 0; i < minArray.length; i ++) {
            if ( minArray[i] === false || maxArray[i] === false ) {
              surfbreakInfoSuccess = false;
              break;
            } else {
              if (minArray[i] > largestMinHeight) {
                largestMinHeight = minArray[i];
                largestMinHeightIndex = i;
              }
            }
          }

          if ( surfbreakInfoSuccess ) {
            var hawaiianScale = 2;
            var min = Math.round( minArray[largestMinHeightIndex] / hawaiianScale );
            var max = Math.round( maxArray[largestMinHeightIndex] / hawaiianScale );
            var heightRange = [min, max];
            var swellDirection = breakArray[0].swell.components.combined.compassDirection;
            var shoreDirection = resultSurfbreak.shore;

            swellInfo.push({
              title          : resultSurfbreak.title,
              heightRange    : heightRange,
              heightMean     : ( (heightRange[0] + heightRange[1]) / 2),
              shoreDirection : shoreDirection,
              swellDirection : swellDirection
            });
          }
          // console.log(swellInfo);
          callback();
        }
      )
    },
    function (err) {

      var sortByHeight = function(arrayName) {
        arrayName.sort(function(a, b){
          if(a.heightRange[1] < b.heightRange[1]) return 1;
          if(a.heightRange[1] > b.heightRange[1]) return -1;
          return 0;
        })
      }

      sortByHeight(swellInfo);

      res.render('results', { title: 'Results', swellInfo: swellInfo });
    }
  );

});

module.exports = router;
