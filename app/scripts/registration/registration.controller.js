/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint quotes: 0 */
/* eslint camelcase: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.registration')
    .controller('RegistrationController', RegistrationController);

  RegistrationController.$inject = [
    '$routeParams',
    '$scope',
    '$q',
    '$location',
    '$filter',
    '$timeout',
    '$mdDateLocale',
    'layoutService',
    'actionService',
    'contactService',
    'accountService',
    'affiliationService',
    'gaService',
    'participantService',
    'questionService',
    'responseService',
    'sessionService',
    'userService',
    'detectionService',
    'sessionParticipationService',
    'DEBUG',
    'API_URI'
  ];

  function RegistrationController(
    $routeParams,
    $scope,
    $q,
    $location,
    $filter,
    $timeout,
    $mdDateLocale,
    layoutService,
    actionService,
    contactService,
    accountService,
    affiliationService,
    gaService,
    participantService,
    questionService,
    responseService,
    sessionService,
    userService,
    detectionService,
    sessionParticipationService,
    DEBUG,
    API_URI
  ) {
    var vm = this;

    // debugging / developing
    vm.debug = DEBUG;
    vm.openAll = false;
    if (vm.debug === true) {
      console.log('DEBUG is ON');
      console.log('API URI', API_URI);
    }

    vm.navigate = layoutService.navigate;

    vm.working = false;
    vm.formStatus = 'open';
    // vm.completeForm = completeForm; // TMP REMOVED

    // date stuff
    $mdDateLocale.formatDate = function(date) {
      return $filter('date')(date, 'dd/MM/yyyy');
    };

    // grab the action
    vm.action = {
      loaded: false,
      error: false
    };
    actionService.retrieveAndInit()
    .then(
      function(action) {
        vm.action = action;
        if (vm.debug) {
          console.log('retrieveAndInit: Action retrieved', vm.action);
        }
      },
      function(err) {
        if (vm.debug) {
          console.log('retrieveAndInit: error retrieving action', err);
        }
        if (err.status === 404) {
          err.messageVerbose = {
            title: 'No action found',
            message: 'Please check URL'
          };
        } else {
          err.messageVerbose = {
            title: 'Error at server',
            message: 'Please reload the page'
          };
        }
        vm.action.error = err;
      }
    );
  }
})();
