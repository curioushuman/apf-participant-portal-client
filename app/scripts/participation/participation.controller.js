/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint quotes: 0 */
/* eslint camelcase: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.participation')
    .controller('ParticipationController', ParticipationController);

  ParticipationController.$inject = [
    '$q',
    '$filter',
    '$mdDateLocale',
    '$scope',
    'actionService',
    'gaService',
    'layoutService',
    'participantService',
    'DEBUG',
    'API_URI'
  ];

  function ParticipationController(
    $q,
    $filter,
    $mdDateLocale,
    $scope,
    actionService,
    gaService,
    layoutService,
    participantService,
    DEBUG,
    API_URI
  ) {
    var vm = this;

    // debugging / developing
    if (DEBUG) {
      console.log('DEBUG is ON');
      console.log('API URI', API_URI);
    }

    vm.navigate = layoutService.navigate;
  }
})();
