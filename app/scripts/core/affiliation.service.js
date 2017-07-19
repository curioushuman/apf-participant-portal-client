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
    '$filter',
    'API_URI'
  ];

  function affiliationService($resource, $filter, API_URI) {

    var Affiliation = $resource(API_URI + '/affiliation',
      {},
      {
        'get': {
          method:'GET',
          url: API_URI + '/affiliation/:contactid/:accountid',
          params: { contactid: '@contactid', accountid: '@accountid' }
        },
        'primary': {
          method:'GET',
          url: API_URI + '/affiliation/primary/:contactid',
          params: { contactid: '@contactid' }
        },
        'update': {
          method:'PUT',
          url: API_URI + '/affiliation/:affiliationid',
          params: { affiliationid: '@affiliationid' }
        }
      }
    );

    var service = {
      Affiliation: Affiliation,
      retrieve: Affiliation.get,
      retrievePrimary: Affiliation.primary,
      isNhri: isNhri
    };

    return service;

    function isNhri(affiliation, nhris) {
      var fi = $filter('filter')(nhris, { Id: affiliation.npe5__Organization__c }).length;
      if (fi > 0) {
        return true;
      }
      return false;
    }
  }
})();
