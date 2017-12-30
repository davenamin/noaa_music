var express = require('express');
var request = require('request');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: "Newport's Tidal Song" });
});

/**
 * we can't have the browser retrieve data from the CO-OPS data service, due to
 * cross origin difficulties. (sort of glad i couldn't figure out how to work
 * around this, since that would mean circumventing basic web security)
 */

/**
 * since we're going to let the user "eval" arbitrary code in their browser,
 * we don't want to just proxy the NOAA site (i'm not expert on secure coding,
 * but i'm pretty sure that's just asking for trouble) - instead, we'll cache
 * a few sets of data from the NOAA CO-OPS data service and refresh them 
 * periodically. the front-end code will grab the pre-cached data from us -
 * no parameter passing or query strings.
 * 
 * the inventory of data products available for Newport is at:
 * https://tidesandcurrents.noaa.gov/inventory.html?id=8452660
 * 
 */

/** water level */
var wl_data;
/** water temperature */
var wt_data;
/** air temperature */
var at_data;
/** wind data */
var wind_data;
/** barometric pressure */
var pressure_data;
/** water conductivity */
var conductivity_data;

var refresh_data = function () {
  coops_url = 'https://tidesandcurrents.noaa.gov/api/datagetter';

  // things we may or may not change
  coops_parameters = {
    format: "json",
    time_zone: "lst_ldt", //local (daylight savings) time
    application: "newport-wav", // whatever we want to identify as
    station: "8452660", // the ID of the newport NOAA station
    datum: "MLLW", // relative to Mean Lower Low Water datum
    units: "english", // because AMERICA
    range: "72" // hours of data
  };

  wl_parameters = JSON.parse(JSON.stringify(coops_parameters));
  wl_parameters.product = "water_level";
  request({ uri: coops_url, qs: wl_parameters, json: true },
    function (error, response, body) {
      if (error) console.log("error: " + error);
      wl_data = body;
    });

  wt_parameters = JSON.parse(JSON.stringify(coops_parameters));
  wt_parameters.product = "water_temperature";
  request({ uri: coops_url, qs: wt_parameters, json: true },
    function (error, response, body) {
      if (error) console.log("error: " + error);
      wt_data = body;
    });

  at_parameters = JSON.parse(JSON.stringify(coops_parameters));
  at_parameters.product = "air_temperature";
  request({ uri: coops_url, qs: at_parameters, json: true },
    function (error, response, body) {
      if (error) console.log("error: " + error);
      at_data = body;
    });

  wind_parameters = JSON.parse(JSON.stringify(coops_parameters));
  wind_parameters.product = "wind";
  request({ uri: coops_url, qs: wind_parameters, json: true },
    function (error, response, body) {
      if (error) console.log("error: " + error);
      wind_data = body;
    });

  pressure_parameters = JSON.parse(JSON.stringify(coops_parameters));
  pressure_parameters.product = "air_pressure";
  request({ uri: coops_url, qs: pressure_parameters, json: true },
    function (error, response, body) {
      if (error) console.log("error: " + error);
      pressure_data = body;
    });

  conductivity_parameters = JSON.parse(JSON.stringify(coops_parameters));
  conductivity_parameters.product = "conductivity";
  request({ uri: coops_url, qs: conductivity_parameters, json: true },
    function (error, response, body) {
      if (error) console.log("error: " + error);
      conductivity_data = body;
    });
};

router.get('/wl', function (req, res, next) {
  res.json(wl_data);
});

router.get('/wt', function (req, res, next) {
  res.json(wt_data);
});


router.get('/at', function (req, res, next) {
  res.json(at_data);
});


router.get('/wind', function (req, res, next) {
  res.json(wind_data);
});


router.get('/pressure', function (req, res, next) {
  res.json(pressure_data);
});

router.get('/conductivity', function (req, res, next) {
  res.json(conductivity_data);
});

// get fresh data
refresh_data();

module.exports = router;
