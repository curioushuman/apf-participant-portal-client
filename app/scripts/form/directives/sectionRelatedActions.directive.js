/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionRelatedActions', gzSectionRelatedActions);

  gzSectionRelatedActions.$inject = [

  ];

  function gzSectionRelatedActions() {
    return {
      require: '^^gzSection',
      controller: SectionRelatedActionsController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/form/directives/sectionRelatedActions.template.html',
      restrict: 'E',
      scope: {
        page: '=',
        form: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.related_actions;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  SectionRelatedActionsController.$inject = [
    '$q',
    '$scope',
    'actionService',
    'gaService',
    'participantService',
    'DEBUG'
  ];

  function SectionRelatedActionsController(
    $q,
    $scope,
    actionService,
    gaService,
    participantService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.related_actions;
    vm.section.requestTime = {};
    vm.section.required = [];
    vm.section.actionsAndContactLoaded = {
      actions: null,
      contact: false
    };

    vm.page.relatedActions = [];
    vm.page.relatedActionParticipants = [];

    // do some things once we know this section is enabled
    $scope.$watch('vm.page.sectionsEnabled', function(value) {
      if (
        vm.page.sectionsEnabled === true &&
        vm.section.enabled !== undefined &&
        vm.section.enabled === true
      ) {
        // grab actions that are related to this action
        if (vm.section.actionsAndContactLoaded.actions === null) {
          retrieveRelatedActions()
          .then(
            function(actions) {
              vm.page.relatedActions = actions;
              if (vm.page.relatedActions.length > 0) {
                vm.section.actionsAndContactLoaded.actions = true;
                if (DEBUG) {
                  console.log('Found related actions', vm.page.relatedActions);
                }
              } else {
                vm.section.actionsAndContactLoaded.actions = false;
                if (DEBUG) {
                  console.log('No related actions were found', actions.length);
                }
              }
            },
            function(err) {
              vm.section.errorInitial = true;
              if (DEBUG) {
                console.log(
                  'There was an error retrieving the related actions',
                  err
                );
              }
            }
          );
        }
      }
    });

    // watch for changes to contact.Id
    $scope.$watch('vm.page.contact.Id', function(value) {
      if (DEBUG) {
        console.log(
          'vm.page.contact changed (detected within sectionRelatedActions)',
          vm.page.contact
        );
      }
      if (vm.page.contact.exists === true) {
        // this indicates a contact was found
        vm.section.actionsAndContactLoaded.contact = true;
      }
    });

    // Wait until contact is found, and related actions exist
    $scope.$watch('vm.section.actionsAndContactLoaded', function(value) {
      if (
        vm.section.actionsAndContactLoaded.actions === true &&
        vm.section.actionsAndContactLoaded.contact === true
      ) {
        // if contact exists, look for related action participant records
        gaService.addSalesforceRequest('List', 'Participant');
        participantService.listByRelatedAction(
          {
            contactid: vm.page.contact.Id,
            actionid: vm.page.action.Id
          },
          function(participants) {
            gaService.addSalesforceResponse(
              'List',
              'Participant'
            );

            vm.page.relatedActionParticipants = participants;

            if (DEBUG) {
              console.log('Related Action Participants found', participants);
            }
          },
          function(err) {
            if (err.status === 404) {
              // this is ok, we just didn't find any participant records
              // we won't create them now as they haven't yet indicated
              // what they will attend
              if (DEBUG) {
                console.log(
                  'Related Action Participants do not yet exist'
                );
              }
            } else {
              gaService.addSalesforceError(
                'List',
                'Participant',
                err.status
              );
              if (DEBUG) {
                console.log('Error retrieving related participants', err);
              }
              // WHAT DO WE DO UPON ERROR?
            }
          }
        );
      }
    });

    // whenever the participant changes, update the related participants
    $scope.$watch('vm.page.participant', function(value) {
      // finish this later
      // this is if a contact exists, and participants exist for that contact
    });

    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        resolve(true);
      });
    };

    vm.section.process = function() {
      return $q(function(resolve, reject) {
        // HAVEN'T FNISHED THIS

      });
    };

    function retrieveRelatedActions() {
      vm.section.requestTime.retrieveRelatedActions =
        gaService.addSalesforceRequest('List', 'Action');
      return actionService.listByRelatedAction(
        {
          actionid: vm.page.action.Id
        }
      )
      .$promise
      .then(
        function(data) {
          gaService.addSalesforceResponse(
            'List',
            'Action',
            vm.section.requestTime.retrieveRelatedActions
          );
          return data;
        },
        function(err) {
          gaService.addSalesforceError(
            'List',
            'Action',
            vm.section.requestTime.retrieveRelatedActions,
            err.status
          );
          return err;
        }
      );
    }

    function initRelatedActionParticipants() {
      angular.forEach(vm.page.relatedActions, function(relatedAction, index) {
        var participant = participantService.initParticipant(
          relatedAction,
          vm.page.contact
        );
        participantService.setDetectionResults(participant);
        // save each of the participants as you do for the main one
        participantService.save(participant)
        .then(
          function(participant) {
            if (DEBUG) {
              console.log(
                'RelatedActions: New Participant saved',
                participant
              );
            }
            vm.page.relatedActionParticipants.push(participant);
          },
          function(err) {
            if (DEBUG) {
              console.log(
                'RelatedActions: Error saving new participant',
                err
              );
            }
          }
        );
      });
    }
  }
})();
