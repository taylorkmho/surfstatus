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

          var minArray = [breakArray[0].swell.minBreakingHeight, breakArray[1].swell.minBreakingHeight, breakArray[2].swell.minBreakingHeight, breakArray[3].swell.minBreakingHeight, breakArray[4].swell.minBreakingHeight, breakArray[5].swell.minBreakingHeight];
          var maxArray = [breakArray[0].swell.maxBreakingHeight, breakArray[1].swell.maxBreakingHeight, breakArray[2].swell.maxBreakingHeight, breakArray[3].swell.maxBreakingHeight, breakArray[4].swell.maxBreakingHeight, breakArray[5].swell.maxBreakingHeight];
          var surfbreakInfoSuccess = true;

          for (var i = 0; i < 5; i ++) {
            if ( minArray[i] === false || maxArray[i] === false ) {
              surfbreakInfoSuccess = false;
              console.log(resultSurfbreak.title, ' returned false min/max Height');
              break;
            }
          }

          if ( surfbreakInfoSuccess ) {
            var minMinHeight = Math.min.apply(Math, minArray);
            var maxMaxHeight = Math.max.apply(Math, maxArray);
            console.log(resultSurfbreak.title + ' -- minMin = ' + minMinHeight);
            console.log(resultSurfbreak.title + ' -- maxMax = ' + maxMaxHeight);
            var heightRange = [minMinHeight, maxMaxHeight];

            var swellDirection = breakArray[0].swell.components.combined.compassDirection;

            swellInfo.push( { title: resultSurfbreak.title, heightRange : heightRange, swellDirection: swellDirection } );
          }

          callback();
        }
      )
    },
    function (err) {

      var sortByTitle = function(arrayName) {
        arrayName.sort(function(a, b){
          if(a.title.toLowerCase() < b.title.toLowerCase()) return -1;
          if(a.title.toLowerCase() > b.title.toLowerCase()) return 1;
          return 0;
        })
      }

      sortByTitle(swellInfo);

      res.render('results', { title: 'Results', swellInfo: swellInfo });
    }
  );

});

module.exports = router;
