/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global ga */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('gaService', gaService);

  gaService.$inject = [
    'DEBUG'
  ];

  function gaService(DEBUG) {
    var requestTimes = {};

    var service = {
      addEvent: addEvent,
      addSalesforceRequest: addSalesforceRequest,
      addSalesforceResponse: addSalesforceResponse,
      addSalesforceError: addSalesforceError,
      setUserId: setUserId
    };

    return service;

    function addEvent(category, action, label, value) {
      if (DEBUG) {
        var gaDebug = {
          category: category,
          action: action,
          label: label,
          value: value
        };
        console.log('GA Event', gaDebug);
      } else if (value === undefined) {
        ga('send', {
          hitType: 'event',
          eventCategory: category,
          eventAction: action,
          eventLabel: label
        });
      } else {
        ga('send', {
          hitType: 'event',
          eventCategory: category,
          eventAction: action,
          eventLabel: label,
          eventValue: value
        });
      }
    }

    function addSalesforceEvent(category, action, label, value) {
      if (value === undefined) {
        addEvent('Salesforce API ' + category, action, label);
      } else {
        addEvent('Salesforce API ' + category, action, label, value);
      }
      return timestampNow();
    }

    function addSalesforceRequest(action, label) {
      requestTimes[action + label] = timestampNow();
      addSalesforceEvent('Request', action, label);
      return timestampNow();
    }

    function addSalesforceResponse(action, label) {
      var requestTime = requestTimes[action + label];
      var timeElapsed;
      if (requestTime === undefined) {
        addSalesforceEvent('Response', action, label);
      } else {
        timeElapsed = timestampNow() - requestTime;
        addSalesforceEvent('Response', action, label, timeElapsed);
        delete requestTimes[action + label];
      }
    }

    function addSalesforceError(action, label, errorStatus) {
      var requestTime = requestTimes[action + label];
      var timeElapsed;
      if (requestTime === undefined) {
        addSalesforceEvent('Error ' + errorStatus, action, label, timeElapsed);
      } else {
        timeElapsed = timestampNow() - requestTime;
        addSalesforceEvent('Error ' + errorStatus, action, label, timeElapsed);
        delete requestTimes[action + label];
      }
    }

    function setUserId(email) {
      if (DEBUG) {
        console.log('GA userId', hashEmail(email));
      } else {
        ga('set', 'userId', hashEmail(email));
      }
    }

    function hashEmail(email) {
      var hash = 0;
      var i;
      var chr;
      if (email.length === 0) {
        return hash;
      }
      for (i = 0; i < email.length; i++) {
        chr = email.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      return hash;
    }

    function timestampNow() {
      return Date.now();
    }
  }
})();
