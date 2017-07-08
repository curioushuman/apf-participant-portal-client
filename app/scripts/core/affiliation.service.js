/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('affiliationService', affiliationService);

  affiliationService.$inject = [
    '$resource',
    'API_URI'
  ];

  function affiliationService($resource, API_URI) {

    var Affiliation = $resource(API_URI + '/affiliation/:contactid/:accountid',
      { contactid: '@contactid', accountid: '@accountid' }
    );

    var service = {
      retrieve: Affiliation.get
    };

    return service;
  }
})();
