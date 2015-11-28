var express = require('express');
var router = express.Router();

var surfbreaksList = require('../data/surfbreaks.json');

/* GET users listing. */
router.get('/', function(req, res, next) {

  var quiver = req.query.quiver;

  if (quiver) {
    console.log('quiver exists and is ' + quiver);
  } else {
    console.log('quiver does not exist');
  }

  res.render('results', { title: 'Results', surfbreaks: surfbreaksList });

});

module.exports = router;
