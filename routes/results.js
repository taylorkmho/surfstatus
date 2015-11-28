var express = require('express');
var router = express.Router();

var surfbreaksList = require('../data/surfbreaks.json');

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


  res.render('results', { title: 'Results', surfbreaks: breaksBasedOnQueries });
});

module.exports = router;
