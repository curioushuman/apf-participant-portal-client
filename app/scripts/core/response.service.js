/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('responseService', responseService);

  responseService.$inject = [
    '$resource',
    'API_URI'
  ];

  function responseService($resource, API_URI) {

    var Response = $resource(API_URI + '/response/:participantid/:questionid',
      { participantid: '@participantid', questionid: '@questionid' }
    );

    var service = {
      list: Response.query,
      retrieve: Response.get
    };

    return service;
  }
})();
