'use strict';

/*
  Directions messages
*/

// addClass(document.querySelector('[data-shore="north"]'), 'oahu__clips__clip--active');


var directions = document.querySelectorAll('.directions__direction');

if (directions) {
  for (var i = 0; i < directions.length; i ++) {
    var thisBreaks = directions[i].querySelectorAll('.surfbreak');

    // SET DESCRIPTIVE SURF CONDITIONS
    var sumHeightMeans = 0;
    for (var breakIndex = 0; breakIndex < thisBreaks.length; breakIndex++) {
      sumHeightMeans = sumHeightMeans + parseFloat(thisBreaks[breakIndex].getAttribute('data-height-mean'));
      var thisAverage = sumHeightMeans / thisBreaks.length;
    }

    var setSurfConditions = function(surfConditions) {
      directions[i].querySelector('.direction__height').innerHTML = surfConditions;
    };
    if (thisAverage < 1) {
      setSurfConditions('flat');
    } else if (thisAverage >= 1 && thisAverage < 1.5) {
      setSurfConditions('small');
    } else if (thisAverage >= 1.5 && thisAverage < 2) {
      setSurfConditions('not bad');
    } else if (thisAverage >= 2 && thisAverage < 5) {
      setSurfConditions('good');
    } else if (thisAverage >= 5 && thisAverage < 8) {
      setSurfConditions('firing');
    } else if (thisAverage >= 8) {
      setSurfConditions('massive');
    }
  }

  // CREATE CAROUSELS
  var wallopEl01 = document.querySelector('.Wallop-01');
  var slider01 = new Wallop(wallopEl01);
  wallopEl01.addEventListener('click', function(){
    slider01.next();
  })
  var wallopEl02 = document.querySelector('.Wallop-02');
  var slider02 = new Wallop(wallopEl02);
  wallopEl02.addEventListener('click', function(){
    slider02.next();
  })
  var wallopEl03 = document.querySelector('.Wallop-03');
  var slider03 = new Wallop(wallopEl03);
  wallopEl03.addEventListener('click', function(){
    slider03.next();
  })
  var wallopEl04 = document.querySelector('.Wallop-04');
  var slider04 = new Wallop(wallopEl04);
  wallopEl04.addEventListener('click', function(){
    slider04.next();
  })

}