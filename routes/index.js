var express        = require('express');
var request        = require('request');
var async          = require('async');
var parseXML       = require('xml2js').parseString;

var router         = express.Router();

var mongoose = require('mongoose');
var surfDataModel = require('../models/surf-data');
var weatherDataModel = require('../models/weather-data');
var tideDataModel = require('../models/tide-data');

var recentSurf    = new Array(),
    recentWeather = new Array(),
    recentTide    = new Array();

router.get('/', function(req, res, next) {

  async.parallel([
    function(callback) {
      mongoose.model('SurfData').find().sort('-timestamp').limit(1).exec(function(err, surfData) {
        recentSurf = surfData[0];
        callback();
      })
    },
    function(callback) {
      mongoose.model('WeatherData').find().sort('-timestamp').limit(1).exec(function(err, weatherData) {
        recentWeather = weatherData[0];
        callback();
      })
    },
    function(callback) {
      mongoose.model('TideData').find().sort('-timestamp').limit(1).exec(function(err, tideData) {
        recentTide = tideData[0];
        callback();
      })
    }
    ],
    function(err, results) {
      res.render('index', { title: 'surfstatus - your new favorite surf report', recentSurf: recentSurf, recentWeather: recentWeather, recentTide: recentTide});
    }
  );

});

module.exports = router;
