/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint quotes: 0 */
/* eslint camelcase: 0 */
/* eslint no-undef: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.registration')
    .controller('RegistrationController', RegistrationController);

  RegistrationController.$inject = [
    '$q',
    '$filter',
    '$mdDateLocale',
    '$scope',
    'actionService',
    'detectionService',
    'gaService',
    'layoutService',
    'participantService',
    'DEBUG',
    'API_URI'
  ];

  function RegistrationController(
    $q,
    $filter,
    $mdDateLocale,
    $scope,
    actionService,
    detectionService,
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
    vm.refresh = layoutService.refresh;

    // at some point make this better
    // if (!DEBUG) {
    //   window.onbeforeunload = function(e) {
    //     return 'Are you sure you want to navigate away from this page?';
    //   };
    // }

    vm.page = {
      email: null,
      working: false,
      requests: {},
      currentSection: '',
      sections: {
        email: {
          id: 'email',
          title: 'Email',
          next: 'personal',
          enabled: true,
          first: true
        },
        personal: {
          id: 'personal',
          title: 'Personal information',
          next: 'contact',
          enabled: true
        },
        contact: {
          id: 'contact',
          title: 'Contact information',
          next: 'organisation',
          enabled: true
        },
        organisation: {
          id: 'organisation',
          title: 'Organisation',
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
          title: 'English Skills',
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
          next: 'related_actions',
          enabled: false,
          enabler: 'Show_Sessions_section__c'
        },
        related_actions: {
          id: 'related_actions',
          title: 'Related Events',
          next: false,
          enabled: false,
          enabler: 'Show_Related_Events_section__c'
        }
      },
      sectionsEnabled: false
    };

    // this could do with some minor attention
    // if participant save fails you should show an error
    vm.page.complete = function() {
      vm.page.working = false;
      if (DEBUG) {
        console.log('Completing form');
      }
      // just submit, don't show a summary of all fields
      // indicate the participant has completed the form
      vm.page.participant.Registration_complete__c = true;
      participantService.save(vm.page.participant)
      .then(
        function(participant) {
          if (DEBUG) {
            console.log('Final: Participant saved');
          }
        },
        function(err) {
          if (DEBUG) {
            console.log('Final: Error saving participant', err);
          }
        }
      );

      vm.page.currentSection = false;
      vm.page.action.formStatus = 'complete';
      layoutService.navigate(null, 'top');
    };

    vm.page.save = function() {
      vm.page.working = false;
      vm.page.resumeSection = vm.page.currentSection;
      vm.page.currentSection = false;
      vm.page.action.formStatus = 'saved';
      layoutService.navigate(null, 'top');
    };

    vm.page.resume = function() {
      vm.page.working = false;
      vm.page.currentSection = vm.page.sections[vm.page.resumeSection].next;
      vm.page.action.formStatus = 'open';
      layoutService.navigate(null, 'top');
    };

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

        if (DEBUG) {
          console.log('Is training?', vm.page.action.isTraining);
        }

        // Now that the action has loaded
        // start detection process
        // UP TO — pass this a callback, or use $q
        detectionService.detect(setDetectionResults);
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

    // make space for the contact and participant
    vm.page.contact = {};
    vm.page.participant = {};
    // some initial contact and participant stuff
    $scope.$watch('vm.page.contact.Id', function(value) {
      if (DEBUG) {
        console.log('vm.page.contact changed', vm.page.contact);
        console.log('CHANGE ID', vm.page.contact.Id);
      }

      // if they exist, see if they're already registered as a participant
      if (vm.page.contact.exists === true) {
        gaService.addSalesforceRequest(
          'Retrieve Participant',
          vm.page.contact.Email + ' @ ' + vm.page.action.Name
        );
        participantService.retrieve(
          {
            contactid: vm.page.contact.Id,
            actionid: vm.page.action.Id
          },
          function(participant) {
            gaService.addSalesforceResponse(
              'Retrieve Participant',
              vm.page.contact.Email + ' @ ' + vm.page.action.Name
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
              vm.page.participant = participantService.initParticipant(
                vm.page.action,
                vm.page.contact
              );

              // set the detection results here as well
              // this will do nothing more than set the values on the
              // participant, to those found in detection service
              // if they exist
              // if they do not, they'll be added later, when they do
              // as this is one of the first saves we want to make sure they
              // exist on the freshly minted participant
              setDetectionResults();

              // do a quick participant save to kick things off
              participantService.save(vm.page.participant)
              .then(
                function(participant) {
                  if (DEBUG) {
                    console.log('Initial: New Participant saved');
                  }
                },
                function(err) {
                  if (DEBUG) {
                    console.log('Initial: Error saving new participant', err);
                  }
                }
              );
            } else {
              gaService.addSalesforceError(
                'Retrieve Participant',
                vm.page.contact.Email + ' @ ' + vm.page.action.Name,
                err.status
              );
              if (DEBUG) {
                console.log('Error retrieving participant', err);
              }
              // WHAT DO WE DO UPON ERROR?
              // we weren't doing anything before
              // this can be an open todo for now
              // an idea might be to have a page.error = true
              // and display that potentially in a similar place to
              // where the section errors appear
            }
          }
        );
      } else if (vm.page.contact.Id !== undefined) {
        // this section only fires once a New Contact has been created
        if (DEBUG) {
          console.log('No contact found, empty participant created');
        }
        vm.page.participant = participantService.initParticipant(
          vm.page.action,
          vm.page.contact
        );
        // set and save (as above)
        setDetectionResults();
        participantService.save(vm.page.participant)
        .then(
          function(participant) {
            if (DEBUG) {
              console.log('Initial: New Participant saved');
            }
          },
          function(err) {
            if (DEBUG) {
              console.log('Initial: Error saving new participant', err);
            }
          }
        );
      }
    });

    function setDetectionResults() {
      if (
        participantService.setDetectionResults(vm.page.participant) === true
      ) {
        // you could do a participant save here if you wanted to save the
        // detection results independently
        // OR
        // wait until they're saved during one of the many other participant
        // saves

        // it is advised to wait, so participation identification can be
        // completed first
      }
    }
  }
})();
