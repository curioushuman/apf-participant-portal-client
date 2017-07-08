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

    var Participant = $resource(API_URI + '/participant/:contactid/:actionid',
      { contactid: '@contactid', actionid: '@actionid' }
    );

    var service = {
      retrieve: Participant.get
    };

    return service;
  }
})();
