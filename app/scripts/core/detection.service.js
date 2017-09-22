/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('detectionService', detectionService);

  detectionService.$inject = [
    'DEBUG',
    'API_URI'
  ];

  function detectionService(DEBUG, API_URI) {

    // connection detection
    var imgUrl = API_URI.replace('salesforce', 'img') + '/test.jpg';
    var imgSize = 4995374;
    var startTime = 0;
    var endTime = 0;
    var connectionResults = {
      duration: 0,
      bitsLoaded: 0,
      speedBps: 0,
      speedKbps: 0,
      speedMbps: 0
    };

    // platform detection
    // reliant on platform.js
    var platformResults = {
      os: platform.os.family + ' ' + platform.os.version,
      browser: platform.name + ' ' + platform.version,
      resolution: window.screen.availWidth + ' x ' + window.screen.availHeight
    };
    var test = platform.name + ' ' + platform.version;
    if (DEBUG) {
      console.log('platform', platformResults);
    }

    var service = {
      detectConnection: detectConnection,
      connectionResults: connectionResults,
      platformResults: platformResults
    };

    return service;

    function detectConnection(callback) {
	    var download = new Image();
	    download.onload = function () {
        if (DEBUG) {
          console.log('Loading image...');
        }
        endTime = (new Date()).getTime();
        calculateConnection();
        // this is a bit old school but...
        // I don't know if onload (and IE10) will support promises
        callback();
	    }

      download.onerror = function (err, msg) {
        if (DEBUG) {
          console.log('Error', err);
          console.log('Error msg', msg);
        }
	    }

	    startTime = (new Date()).getTime();
	    var cacheBuster = "?nnn=" + startTime;
	    download.src = imgUrl + cacheBuster;
      if (DEBUG) {
        console.log('Src set...', download.src);
      }
    }

    function calculateConnection() {
      if (DEBUG) {
        console.log('Calculating...');
      }
      connectionResults.duration = (endTime - startTime) / 1000;
      connectionResults.bitsLoaded = imgSize * 8;
      connectionResults.speedBps =
        (connectionResults.bitsLoaded / connectionResults.duration).toFixed(2);
      connectionResults.speedKbps =
        (connectionResults.speedBps / 1024).toFixed(2);
      connectionResults.speedMbps =
        (connectionResults.speedKbps / 1024).toFixed(2);
	  }
  }
})();
