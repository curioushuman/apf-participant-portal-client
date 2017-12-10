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
    if (vm.debug === true) {
      console.log('DEBUG is ON');
      console.log('API URI', API_URI);
    }

    vm.navigate = layoutService.navigate;

    vm.page = {
      working: false,
      currentSection: 'email',
      sections: {
        email: {
          id: 'email',
          title: 'Email',
          next: 'personal'
        },
        personal: {
          id: 'personal',
          title: 'Personal Information',
          next: false
        }
      }
    };

    // FIX THIS WHEN YOU GET TO IT
    vm.page.complete = function() {
      console.log('Completing form');
      // just submit, don't show a summary of all fields
      // indicate the participant has completed the form
      // vm.participant.Registration_complete__c = true;
      // processUpdateParticipant()
      // .then(
      //   function() {
      //     // good stuff
      //   },
      //   function(err) {
      //     if (vm.debug) {
      //       console.log('Error completeForm', err);
      //     }
      //     // ahhh shit
      //   }
      // );
      // vm.working = false;
      // vm.sectionActive = '';
      // vm.expectationsSectionStatus = 'complete';
      // vm.formStatus = 'complete';
      // layoutService.navigate(null, 'top');
    }

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

    // make space for the contact
    vm.page.contact = {
      exists: false
    };
    // NEED TO perform the actions that need to be performed
    // once a contact exists
    // e.g. check for participant etc
  }
})();
