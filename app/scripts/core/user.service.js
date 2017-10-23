/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('userService', userService);

  userService.$inject = [
    '$resource',
    'API_URI'
  ];

  function userService($resource, API_URI) {
    var User = $resource(API_URI + '/user/:uid',
      {
        uid: '@uid'
      }
    );

    var service = {
      list: User.query,
      retrieve: User.get
    };

    return service;
  }
})();
