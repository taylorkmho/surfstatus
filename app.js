var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/surfReportData');

var index = require('./routes/index');

var app = express();

// models
var surfDataModel = require('./models/surf-data');
var weatherDataModel = require('./models/weather-data');
var tideDataModel = require('./models/tide-data');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
// app.use('/report-data', reportData);

app.get('/surf-data', function(req,res) {
  mongoose.model('SurfData').find(function(err, surfData) {
    res.send(surfData);
  })
});
app.get('/weather-data', function(req,res) {
  mongoose.model('WeatherData').find(function(err, WeatherData) {
    res.send(WeatherData);
  })
});
app.get('/tide-data', function(req,res) {
  mongoose.model('TideData').find(function(err, TideData) {
    res.send(TideData);
  })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
