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
      retrievePrimary: Affiliation.primary
    };

    return service;
  }
})();
