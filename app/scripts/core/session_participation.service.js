/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('sessionParticipationService', sessionParticipationService);

  sessionParticipationService.$inject = [
    '$resource',
    'API_URI'
  ];

  function sessionParticipationService($resource, API_URI) {
    var SessionParticipation = $resource(API_URI + '/session_participation',
      {},
      {
        query: {
          method: 'GET',
          url: API_URI + '/session_participation/:participantid',
          params: {
            participantid: '@participantid'
          },
          isArray: true
        },
        get: {
          method: 'GET',
          url: API_URI + '/session_participation/:participantid/:sessionid',
          params: {
            participantid: '@participantid',
            sessionid: '@sessionid'
          }
        },
        update: {
          method: 'PUT',
          url: API_URI + '/session_participation/:session_participationid',
          params: {
            session_participationid: '@session_participationid'
          }
        }
      }
    );

    var service = {
      SessionParticipation: SessionParticipation,
      list: SessionParticipation.query,
      retrieve: SessionParticipation.get
    };

    return service;
  }
})();
