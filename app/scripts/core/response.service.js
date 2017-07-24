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
    var Response = $resource(API_URI + '/response',
      {},
      {
        get: {
          method: 'GET',
          url: API_URI + '/response/:participantid/:questionid',
          params: {
            participantid: '@participantid',
            questionid: '@questionid'
          }
        },
        update: {
          method: 'PUT',
          url: API_URI + '/response/:responseid',
          params: {
            responseid: '@responseid'
          }
        }
      }
    );

    var service = {
      Response: Response,
      list: Response.query,
      retrieve: Response.get
    };

    return service;
  }
})();
