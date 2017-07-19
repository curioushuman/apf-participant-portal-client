/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('accountService', accountService);

  accountService.$inject = [
    '$resource',
    'API_URI'
  ];

  function accountService($resource, API_URI) {

    var Account = $resource(API_URI + '/account',
      {},
      {
        'get': {
          method:'GET',
          url: API_URI + '/account/:accountid',
          params: { accountid: '@accountid' }
        },
        'update': {
          method:'PUT',
          url: API_URI + '/account/:accountid',
          params: { accountid: '@accountid' }
        }
      }
    );

    var service = {
      Account: Account,
      list: Account.query,
      retrieve: Account.get
    };

    return service;
  }
})();
