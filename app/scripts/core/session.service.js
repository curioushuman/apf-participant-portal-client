/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('sessionService', sessionService);

  sessionService.$inject = [
    '$resource',
    'API_URI'
  ];

  function sessionService($resource, API_URI) {
    var Session = $resource(API_URI + '/session/:actionid',
      {
        actionid: '@actionid'
      }
    );

    var service = {
      list: Session.query,
      retrieve: Session.get
    };

    return service;
  }
})();
