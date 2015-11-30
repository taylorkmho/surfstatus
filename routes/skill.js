var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('skill', { title: 'Pick your Skill Level' });
});

module.exports = router;
