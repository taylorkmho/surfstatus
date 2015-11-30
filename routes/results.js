var express        = require('express');
var request        = require('request');
var async          = require('async');
var router         = express.Router();

var surfbreaksList = require('../data/surfbreaks.json');
var secrets        = require('../data/secrets.json');

/* GET users listing. */
router.get('/', function(req, res, next) {

  var cookieBoardsSelected = req.cookies["boardsSelected"];
  var cookieSkillSelected = req.cookies["skillSelected"];
  var boardsSelectedBinary = req.cookies["boardsSelectedBinary"];

  var breaksBasedOnQueries = [];

  /*
    Add surfbreaks to [breaksBasedOnQueries]
    if [quiverQuery] meets [surfBreaksList] surfbreaks
  */
  if (boardsSelectedBinary) {
    var quiverQuery = boardsSelectedBinary;
  } else {
    var quiverQuery = req.query.quiver;
  }
  if (quiverQuery > 0) {
    var addBreakWith = function(boardType) {
          surfbreaksList.forEach( function(surfbreak) {
            if (
                // [boardType] is in [surfbreak.boards]
                surfbreak.boards.indexOf(boardType) > -1
                // && [surfbreak] is NOT in [breaksBasedOnQueries]
                && breaksBasedOnQueries.indexOf(surfbreak) == -1
            ) {
              // push [surfbreak] to [breaksBasedOnQueries]
              breaksBasedOnQueries.push(surfbreak);
            }
          });
        };

    var quiverParamValues = quiverQuery.split(''),
        boardOptions = ['BB','SB','LB','SUP'];;
    for (var i=0; i < boardOptions.length; i++) {
      if (quiverParamValues[i] > 0) {
        addBreakWith(boardOptions[i]);
      }
    }

  } else if (quiverQuery < 1) {
    // ?quiver=0000
    console.log('YOU NEED A BOARD');
  }
  else {
    // no quiver URL parameter
    console.log('quiver does not exist');
  }

  /*
    Remove surfbreaks from [breaksBasedOnQueries]
    if [skillQuery] does not meet [surfBreaksList] surfbreaks
  */
  if (cookieSkillSelected) {
    var skillQuery = cookieSkillSelected;
  } else {
    var skillQuery = req.query.skill;
  }
  if (skillQuery > 0) {
    var removeBreakIfSkillsDontMeet = function() {
          // iterate backward through [breaksBasedOnQueries]
          //   ref - http://stackoverflow.com/a/16352560/2821119
          // to remove surfbreaks that the [skillQuery] does not satisfy
          for(var i = breaksBasedOnQueries.length -1; i >= 0 ; i--){
            var thisBreakIndex = breaksBasedOnQueries[i];

            // if [skillQuery] is less than a [breaksBasedOnQueries] break's requirement
            if ( skillQuery < thisBreakIndex.skill ) {
              // get this break's index based on it's location in [breaksBasedOnQueries]
              var indexBreakBOQ = breaksBasedOnQueries.indexOf(thisBreakIndex);
              // cut it out
              breaksBasedOnQueries.splice(indexBreakBOQ, 1);
            }
          }

        }();

  } else {
    // no skill URL parameter
    console.log('skill is 0 or does not exist');
  }

  /*
    MAGIC SEAWEED ACTION
  */
  var magicSWKey = secrets[0].apiKeys.magicSW;
  // // console.log(magicSWKey);
  var swellInfo = new Array();
  // console.log(breaksBasedOnQueries);
  async.each(
    breaksBasedOnQueries,
    function(resultSurfbreak, callback) {

      request(
        { url: "http://magicseaweed.com/api/" + magicSWKey+ "/forecast/?spot_id=" + resultSurfbreak.magicSW, method: "GET", timeout: 10000 },
        function(error, response, body) {
          // needs error handler

          var breakArray = JSON.parse(body);
          var heightRange = [ breakArray[1].swell.minBreakingHeight, breakArray[1].swell.maxBreakingHeight ];
          var swellDirection = breakArray[1].swell.components.combined.compassDirection;

          swellInfo.push( { title: resultSurfbreak.title, heightRange : heightRange, swellDirection: swellDirection } );

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
      sortByTitle(breaksBasedOnQueries);

      // console.log(swellInfo);
      // console.log(breaksBasedOnQueries);

      res.render('results', { title: 'Results', surfbreaks: breaksBasedOnQueries, swellInfo: swellInfo });
    }
  );

});

module.exports = router;
