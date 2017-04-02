var express = require('express');
var request = require('request');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Newport's Tidal Song" });
});

/**
 * we can't have the browser retrieve data from the CO-OPS data service, due to
 * cross origin difficulties. (sort of glad i couldn't work around this, since
 * that would mean circumventing basic web security)
 */
router.get('/coops', function(req, res, next) {
  // url for CO-OPS data service..
  coops_url = 'https://tidesandcurrents.noaa.gov/api/datagetter';
  req.pipe(request({uri: coops_url, qs: req.query})).pipe(res);
})

module.exports = router;
