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
        get: {
          method: 'GET',
          url: API_URI + '/account/:accountid',
          params: {
            accountid: '@accountid'
          }
        },
        queryType: {
          method: 'GET',
          url: API_URI + '/account/type/:type',
          params: {
            type: '@type'
          },
          isArray: true
        },
        queryTypeExclude: {
          method: 'GET',
          url: API_URI + '/account/type/:type?exclude=true',
          params: {
            type: '@type'
          },
          isArray: true
        },
        update: {
          method: 'PUT',
          url: API_URI + '/account/:accountid',
          params: {
            accountid: '@accountid'
          }
        }
      }
    );

    var service = {
      Account: Account,
      list: Account.query,
      listByType: Account.queryType,
      listByOtherTypes: Account.queryTypeExclude,
      retrieve: Account.get
    };

    return service;
  }
})();
