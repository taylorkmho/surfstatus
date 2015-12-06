'use strict';

/*
  Directions messages
*/

// addClass(document.querySelector('[data-shore="north"]'), 'oahu__clips__clip--active');


var directions = document.querySelectorAll('.directions__direction');

if (directions) {
  for (var i = 0; i < directions.length; i ++) {
    var thisBreaks = directions[i].querySelectorAll('.surfbreak');

    // CREATE CAROUSELS
    var wallopEl = directions[i].querySelector('.Wallop');
    var slider = new Wallop(wallopEl);

    // SET DESCRIPTIVE SURF CONDITIONS
    var sumHeightMeans = 0;
    for (var breakIndex = 0; breakIndex < thisBreaks.length; breakIndex++) {
      sumHeightMeans = sumHeightMeans + parseFloat(thisBreaks[breakIndex].getAttribute('data-height-mean'));
      var thisAverage = sumHeightMeans / thisBreaks.length;
    }

    var setSurfConditions = function(surfConditions) {
      directions[i].querySelector('.direction__height').innerHTML = surfConditions;
    };
    if (thisAverage < .5) {
      setSurfConditions('flat');
    } else if (thisAverage >= .5 && thisAverage < 2) {
      setSurfConditions('not bad');
    } else if (thisAverage >= 2 && thisAverage < 4) {
      setSurfConditions('big');
    } else if (thisAverage >= 4 && thisAverage < 8) {
      setSurfConditions('firing');
    } else if (thisAverage >= 8) {
      setSurfConditions('massive');
    }
  }

}