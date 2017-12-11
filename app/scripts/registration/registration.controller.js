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
    if (DEBUG) {
      console.log('DEBUG is ON');
      console.log('API URI', API_URI);
    }

    vm.navigate = layoutService.navigate;

    vm.page = {
      email: null,
      working: false,
      currentSection: 'email',
      sections: {
        email: {
          id: 'email',
          title: 'Email',
          next: 'personal',
          enabled: true
        },
        personal: {
          id: 'personal',
          title: 'Personal Information',
          next: 'organisation',
          enabled: true
        },
        organisation: {
          id: 'organisation',
          title: 'Organisation',
          next: 'contact',
          enabled: true
        },
        contact: {
          id: 'contact',
          title: 'Contact details',
          next: 'experience',
          enabled: true
        },
        experience: {
          id: 'experience',
          title: 'Experience',
          next: 'it_skills',
          enabled: false,
          enabler: 'Show_Experience_section__c'
        },
        it_skills: {
          id: 'it_skills',
          title: 'IT Skills',
          next: 'english_skills',
          enabled: false,
          enabler: 'Show_IT_Skills_section__c'
        },
        english_skills: {
          id: 'english_skills',
          title: 'Ensligh Skills',
          next: 'expectations',
          enabled: false,
          enabler: 'Show_English_Skills_section__c'
        },
        expectations: {
          id: 'expectations',
          title: 'Expectations',
          next: 'sessions',
          enabled: false,
          enabler: 'Show_Expectations_section__c'
        },
        sessions: {
          id: 'sessions',
          title: 'Sessions',
          next: false,
          enabled: false,
          enabler: 'Show_Sessions_section__c'
        }
      },
      sectionsEnabled: false
    };

    // FIX THIS WHEN YOU GET TO IT
    vm.page.complete = function() {
      vm.page.working = false;
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
      //     if (DEBUG) {
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
    vm.page.action = {
      loaded: false,
      error: false
    };
    actionService.retrieveAndInit()
    .then(
      function(action) {
        vm.page.action = action;
        if (DEBUG) {
          console.log('retrieveAndInit: Action retrieved', vm.page.action);
        }

        // enable the relevant sections
        angular.forEach(vm.page.sections, function(section, index) {
          if (vm.page.action[section.enabler] === true) {
            section.enabled = true;
          }
        });
        vm.page.sectionsEnabled = true;

        // Now that the action has loaded
        // start detection process
        detectionService.detect();
      },
      function(err) {
        if (DEBUG) {
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
        vm.page.action.error = err;
      }
    );

    // make space for the contact
    vm.page.contact = {};
    $scope.$watch('vm.page.contact', function(value) {
      if (DEBUG) {
        console.log('vm.page.contact changed', vm.page.contact);
      }

      if (vm.page.contact.exists === true) {
        gaService.addSalesforceRequest('Retrieve', 'Participant');
        participantService.retrieve(
          {
            contactid: vm.page.contact.Id,
            actionid: vm.page.action.Id
          },
          function(participant) {
            gaService.addSalesforceResponse(
              'Retrieve',
              'Participant'
            );

            vm.page.participant = participant;
            vm.page.participant.exists = true;

            if (DEBUG) {
              console.log('Participant found', participant);
            }
          },
          function(err) {
            if (err.status === 404) {
              // this is ok, we just didn't find a record
              // create a new Participant object
              vm.page.participant = new participantService.Participant();
              vm.page.participant.exists = false;
            } else {
              gaService.addSalesforceError(
                'Retrieve',
                'Participant',
                err.status
              );
              // WHAT DO WE DO UPON ERROR?
              // we weren't doing anything before
              // this can be an open todo for now
              // an idea might be to have a page.error = true
              // and display that potentially in a similar place to
              // where the section errors appear
            }
          }
        );
      }
    });

    // make space for the participant
    vm.page.participant = {};
    $scope.$watch('vm.page.participant', function(value) {
      if (DEBUG) {
        console.log('vm.page.participant changed', vm.page.participant);
      }

      if (vm.page.participant.exists === true) {
        // DO WE NEED TO DO STUFF HERE?
        // OR IS THIS MORE FOR SESSIONS AND RESPONSES
      } else {
        vm.page.participant.Type__c = 'Participant';
        vm.page.participant.Registration_complete__c = false;
        vm.page.participant.Action__c = vm.page.action.Id;
        vm.page.participant.Contact__c = vm.page.contact.Id;
      }

      // have the connection results been added to the Participant?
      participantService.setDetectionResults(vm.page.participant);
    });

    // WHEN do we save the participant?
    // AT select moments I imagine

    // ADD a WATCHer to participant in both the responses and sessions
    // obtain the data as soon as the participant exists
    // only if enabled = true

    // in the experience section pre-grab the questions
    // only if enabled = true

    // in the sessions section pre-grab the sessions
    // only if enabled = true
  }
})();
