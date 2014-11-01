'use strict';

var http = require ('http');
var cheerio = require('cheerio');
var _ = require('underscore');

var moment = require('moment');

moment().format();

var url = 'http://www.fbschedules.com/ncaa-15/sec/2015-georgia-bulldogs-football-schedule.php';

var respData = '';
var req = http.get(url, function(res) {
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    respData += chunk;
  });
  res.on('end', function () {
    var $ = cheerio.load(respData);
    var tableRows = $('table tr');
    _.each (tableRows, function ( r ) {
      var x = $(r).find('td.cfb2');
      var d = $(r).find('td.cfb1');
      var checkInDate = d.eq(0).text();
      checkInDate = checkInDate.replace('day','day, ');
      var t = x.text().split(',');
      if (t && t.length > 0 && t[1] && t[2]) {
        var cityName = t[1] + ',' + t[2];
        console.log(cityName + ' on ' + checkInDate);

        checkInDate = moment(checkInDate + ' 2015');
        var checkOutDate = moment.unix(checkInDate.unix());
        checkOutDate.add(1,'d');

        console.log(checkInDate.toISOString());
        console.log(checkOutDate.toISOString());

        var typeAheadData = '';
        http.get('http://www.priceline.com/svcs/ac/index/hotels/' + cityName, function(typeAheadResponse) {
          typeAheadResponse.setEncoding('utf8');
          typeAheadResponse.on('data', function (chunk) {
            typeAheadData += chunk;
          });

          typeAheadResponse.on('end', function () {
            var data = JSON.parse(typeAheadData);

            if (data && data.searchItems && data.searchItems.length > 0 && data.searchItems[0].id) {
//              console.log(data.searchItems[0].itemName + ' id is ' + data.searchItems[0].id);
                var ci = checkInDate.format('YYYYMMDD');
                var co = checkOutDate.format('YYYYMMDD');
                var searchURL = 'http://www.priceline.com/api/hotelretail/listing/v3/' + data.searchItems[0].itemName + '/' + ci + '/' + co + '/1/15?activityId=';

                var searchResponseData = '';

                console.log(searchURL);

                http.get(searchURL, function(typeAheadResponse) {
                  typeAheadResponse.setEncoding('utf8');
                  typeAheadResponse.on('data', function (chunk) {
                    searchResponseData += chunk;
                  });

                  typeAheadResponse.on('end', function () {
                    var searchData = JSON.parse(searchResponseData);

                    console.log(searchData);

                  });
                });


            }
          });

        });
      }
    });
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

