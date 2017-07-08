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

    var Account = $resource(API_URI + '/account/:id',
      { slug: '@id' }
    );

    var service = {
      list: Account.query
    };

    return service;
  }
})();
