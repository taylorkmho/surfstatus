var express = require('express');
var router = express.Router();

var surfbreaksList = require('../data/surfbreaks.json');
var secrets = require('../data/secrets.json');

/* GET users listing. */
router.get('/', function(req, res, next) {

  var breaksBasedOnQueries = [];

  /*
    Add surfbreaks to [breaksBasedOnQueries]
    if [quiverQuery] meets [surfBreaksList] surfbreaks
  */
  var quiverQuery = req.query.quiver;
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
  var skillQuery = req.query.skill;
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

  res.render('results', { title: 'Results', surfbreaks: breaksBasedOnQueries, magicSWKey: secrets[0].apiKeys.magicSW });
});

module.exports = router;
