var express = require('express');
var router = express.Router();

var surfbreaksList = require('../data/surfbreaks.json');

/* GET users listing. */
router.get('/', function(req, res, next) {

  var quiver = req.query.quiver;

  if (quiver > 0) {
    var quiverValues = quiver.split(''),
        breaksBasedOnQuiver = [],
        addBreakWith = function(boardType) {
          surfbreaksList.forEach( function(surfbreak) {
            if (
                // [boardType] is in [surfbreak.boards]
                surfbreak.boards.indexOf(boardType) > -1
                &&
                // [surfbreak] is NOT in [breaksBasedOnQuiver]
                breaksBasedOnQuiver.indexOf(surfbreak) == -1
            ) {
              // push [surfbreak] to [breaksBasedOnQuiver]
              breaksBasedOnQuiver.push(surfbreak);
            }
          });
        };

    if (quiverValues[0] > 0) {
      addBreakWith('BB');
    }
    if (quiverValues[1] > 0) {
      addBreakWith('SB');
    }
    if (quiverValues[2] > 0) {
      addBreakWith('LB');
    }
    if (quiverValues[3] > 0) {
      addBreakWith('SUP');
    }

  } else if (quiver < 1) {
    console.log('YOU NEED A BOARD');
  }
  else {
    console.log('quiver does not exist');
  }

  res.render('results', { title: 'Results', surfbreaks: breaksBasedOnQuiver });
});

module.exports = router;
