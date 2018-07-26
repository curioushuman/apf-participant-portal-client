/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('countryService', countryService);

  countryService.$inject = [
    '$q',
    '$resource',
    'gaService',
    'API_URI',
    'DEBUG'
  ];

  function countryService(
    $q,
    $resource,
    gaService,
    API_URI,
    DEBUG
  ) {
    var Country = $resource(API_URI + '/country',
      {},
      {
        get: {
          method: 'GET',
          url: API_URI + '/country/:countryid',
          params: {
            countryid: '@countryid'
          }
        }
      }
    );

    var requestTime = {};
    var requests = {};

    var service = {
      listAll: listAll
    };

    return service;

    function listAll() {
      if (requests.list === undefined) {
        requests.list = $q(function(resolve, reject) {
          requestTime.listAll =
            gaService.addSalesforceRequest('List Countries', 'All');
          Country.query(
            {},
            function(data) {
              gaService.addSalesforceResponse(
                'List',
                'Countries',
                requestTime.listAll
              );
              if (DEBUG) {
                console.log('Countries', data);
              }
              delete requests.list;
              resolve(data);
            },
            function(err) {
              gaService.addSalesforceError(
                'List',
                'Countries',
                requestTime.listAll,
                err.status
              );
              delete requests.list;
              reject(err);
            }
          );
        });
      }
      return requests.list;
    }
  }
})();
