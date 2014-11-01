/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var http = require ('http');
var cheerio = require('cheerio');
var _ = require('underscore');

var moment = require('moment');

moment().format();

var url = 'http://www.fbschedules.com/ncaa-15/sec/2015-georgia-bulldogs-football-schedule.php';

var respData = '';


function search (cityName, ci, co, resultsData, callback) {
  if (cityName && ci && co) {
      var searchURL = 'http://www.priceline.com/api/hotelretail/listing/v3/' + cityName + '/' + ci + '/' + co + '/1/15?activityId=';

      var searchResponseData = '';

      console.log(searchURL);

      http.get(searchURL, function(typeAheadResponse) {
        typeAheadResponse.setEncoding('utf8');
        typeAheadResponse.on('data', function (chunk) {
          searchResponseData += chunk;
        });

        typeAheadResponse.on('end', function () {
          var searchData = JSON.parse(searchResponseData);
          resultsData.push (searchData);
          callback (null);
        });
        typeAheadResponse.on('error', function (err) {
          callback (err);
        });

      });
  } else {
    callback ('missing data');
  }

}
// Get list of things
exports.index = function(request, response) {


  var req = http.get(url, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      respData += chunk;
    });
    res.on('end', function () {
      var $ = cheerio.load(respData);
      var tableRows = $('table tr');
      var searchData = [];
      _.each (tableRows, function ( r ) {
        var x = $(r).find('td.cfb2');
        var d = $(r).find('td.cfb1');
        var checkInDate = d.eq(0).text();
        checkInDate = checkInDate.replace('day','day, ');
        var t = x.text().split(',');
        if (t && t.length > 0 && t[1] && t[2]) {
          t[1] = t[1].replace(/^\s+/,'');
          var cityName = t[1] + ',' + t[2];
          console.log(cityName + ' on ' + checkInDate);

          checkInDate = moment(checkInDate + ' 2015');
          var checkOutDate = moment.unix(checkInDate.unix());
          checkOutDate.add(1,'d');

          var ci = checkInDate.format('YYYYMMDD');
          var co = checkOutDate.format('YYYYMMDD');

          searchData.push (
            {
              name: cityName,
              ci: ci,
              co: co
            });
        }
      });

      var async = require('async');
      var resultsData = [];
      async.each (searchData, function (item, callback ) {
        var key = item.name + '-' + item.ci + '-' + item.co;
        console.log(key);
        search (item.name, item.ci, item.co, resultsData, callback);
      }, function (err) {
        console.log('callback');
        if (err) {
          console.log ('error: ' + err);
        } else {
         console.log('done');
         var responseData = {};
         responseData.status = 'done';
         responseData.results = resultsData;
         response.setHeader("Content-Type", "application/json");
         response.json(responseData);
        }

      });
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });


};



function handleError(res, err) {
  return res.send(500, err);
}