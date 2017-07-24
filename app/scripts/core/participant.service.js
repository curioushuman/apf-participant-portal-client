/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('participantService', participantService);

  participantService.$inject = [
    '$resource',
    'API_URI'
  ];

  function participantService($resource, API_URI) {
    var Participant = $resource(API_URI + '/participant',
      {},
      {
        get: {
          method: 'GET',
          url: API_URI + '/participant/:contactid/:actionid',
          params: {
            contactid: '@contactid',
            actionid: '@actionid'
          }
        },
        update: {
          method: 'PUT',
          url: API_URI + '/participant/:participantid',
          params: {
            participantid: '@participantid'
          }
        }
      }
    );

    var service = {
      Participant: Participant,
      retrieve: Participant.get
    };

    return service;
  }
})();
