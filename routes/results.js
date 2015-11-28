var express = require('express');
var router = express.Router();

var surfbreaksList = require('../data/surfbreaks.json');

/* GET users listing. */
router.get('/', function(req, res, next) {

  var addedBreaksBasedOnQuiver = [],
      boardOptions = ['BB','SB','LB','SUP'];

  var quiver = req.query.quiver;
  if (quiver > 0) {
    var addBreakWith = function(boardType) {
          surfbreaksList.forEach( function(surfbreak) {
            if (
                // [boardType] is in [surfbreak.boards]
                surfbreak.boards.indexOf(boardType) > -1
                &&
                // [surfbreak] is NOT in [addedBreaksBasedOnQuiver]
                addedBreaksBasedOnQuiver.indexOf(surfbreak) == -1
            ) {
              // push [surfbreak] to [addedBreaksBasedOnQuiver]
              addedBreaksBasedOnQuiver.push(surfbreak);
            }
          });
        };

    var quiverParamValues = quiver.split('');
    for (var i=0; i < boardOptions.length; i++) {
      if (quiverParamValues[i] > 0) {
        addBreakWith(boardOptions[i]);
      }
    }

  } else if (quiver < 1) {
    // ?quiver=0000
    console.log('YOU NEED A BOARD');
  }
  else {
    // no quiver URL parameter
    console.log('quiver does not exist');
  }

  res.render('results', { title: 'Results', surfbreaks: addedBreaksBasedOnQuiver });
});

module.exports = router;
