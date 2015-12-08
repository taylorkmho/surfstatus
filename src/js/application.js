'use strict';
/*
 * START
 */

var canvas = document.querySelector( ".waves__canvas" );
if (canvas) {

  var options = {
    color: "rgba(235,67,41,.1)",
    waveAmplitude: 30,
    waveRadius: 200,
    waveElasticity: 0.75,
    waveStrength: 0.01,
    waveMouse: 40,
    waveMax: 100,
    waveComeUp: function() {},
    waveRiseSpeed: 15,
    lineWidth: 5,
    waveLength: 100,
    distance: 20
  };

  var app = new Canvas( canvas, size );

  window.addEventListener( "resize", function() {
    app.setSize( window.innerWidth, window.innerHeight );
  }, false );

}

/*
  Directions messages
*/

// addClass(document.querySelector('[data-shore="north"]'), 'oahu__clips__clip--active');


var directions = document.querySelectorAll('.directions__direction');

if (directions) {
  for (var i = 0; i < directions.length; i ++) {
    var thisBreaks = directions[i].querySelectorAll('.surfbreak');

    // SET DESCRIPTIVE SURF CONDITIONS
    var thisAverage = directions[i].getAttribute('data-height-mean');
    console.log(thisAverage);
    var setSurfConditions = function(surfConditions) {
      directions[i].querySelector('.direction__height').innerHTML = surfConditions;
    };
    if (thisAverage < 1) {
      setSurfConditions('flat');
    } else if (thisAverage >= 1 && thisAverage < 2) {
      setSurfConditions('small');
    } else if (thisAverage >= 2 && thisAverage < 3) {
      setSurfConditions('not bad');
    } else if (thisAverage >= 3 && thisAverage < 4) {
      setSurfConditions('good');
    } else if (thisAverage >= 4 && thisAverage < 7) {
      setSurfConditions('firing');
    } else if (thisAverage >= 7) {
      setSurfConditions('massive');
    }
  }

  // CREATE CAROUSELS
  // var wallopEl01 = document.querySelector('.Wallop-01');
  // var slider01 = new Wallop(wallopEl01);
  // wallopEl01.addEventListener('click', function(){
  //   slider01.next();
  // })
  // var wallopEl02 = document.querySelector('.Wallop-02');
  // var slider02 = new Wallop(wallopEl02);
  // wallopEl02.addEventListener('click', function(){
  //   slider02.next();
  // })
  // var wallopEl03 = document.querySelector('.Wallop-03');
  // var slider03 = new Wallop(wallopEl03);
  // wallopEl03.addEventListener('click', function(){
  //   slider03.next();
  // })
  // var wallopEl04 = document.querySelector('.Wallop-04');
  // var slider04 = new Wallop(wallopEl04);
  // wallopEl04.addEventListener('click', function(){
  //   slider04.next();
  // })

}