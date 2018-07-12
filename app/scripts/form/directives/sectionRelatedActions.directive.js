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
    '$filter',
    '$q',
    '$scope',
    'actionService',
    'gaService',
    'participantService',
    'DEBUG'
  ];

  function SectionRelatedActionsController(
    $filter,
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
    vm.section.relatedActionsExist = null;
    vm.section.relatedActionParticipantsExist = null;

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
        if (vm.section.relatedActionsExist === null) {
          retrieveRelatedActions()
          .then(
            function(actions) {
              vm.page.relatedActions = actions;
              if (vm.page.relatedActions.length > 0) {
                vm.section.relatedActionsExist = true;
                setRelatedEventsAttending();
                if (DEBUG) {
                  console.log('Found related actions', vm.page.relatedActions);
                }
              } else {
                vm.section.relatedActionsExist = false;
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
      if (vm.page.contact.exists === true) {
        if (DEBUG) {
          console.log(
            'vm.page.contact exists (detected within sectionRelatedActions)',
            vm.page.contact
          );
        }
        // contact exists, look for related action participant records
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
            if (vm.page.relatedActionParticipants.length > 0) {
              vm.section.relatedActionParticipantsExist = true;
            }
            setRelatedEventsAttending();

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
      var promises = syncRelatedActionParticipants();
      $q.all(promises).then(
        function(data) {
          if (vm.debug) {
            console.log(
              'Section.RelatedActions: participants synced on update',
              data
            );
          }
        },
        function(err) {
          if (vm.debug) {
            console.log(
              'Section.Experience: error syncing participants on update',
              err
            );
          }
        }
      );
    });

    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        resolve(true);
      });
    };

    vm.section.process = function() {
      return $q(function(resolve, reject) {
        // loop through the related actions
        // create / update participants for opted in actions
        // then run the sync function
        if (DEBUG) {
          console.log(
            'Section.RelatedActions: existing participants',
            vm.page.relatedActionParticipants
          );
        }
        var participantExists = false;
        angular.forEach(vm.page.relatedActions, function(relatedAction, index) {
          if (DEBUG) {
            console.log(
              'Section.RelatedActions: relatedAction',
              relatedAction
            );
          }
          participantExists = false;
          angular.forEach(
            vm.page.relatedActionParticipants,
            function(participant, index) {
              if (participant.Action__c === relatedAction.Id) {
                participantExists = true;
                if (
                  relatedAction.Related_registration_is_automatic__c ||
                  relatedAction.attending
                ) {
                  // do nothing
                } else {
                  participant.Status__c = 'Cancelled';
                  participantService.setDetectionResults(participant);
                }
              }
            }
          );
          if (
            participantExists === false &&
            (
              relatedAction.Related_registration_is_automatic__c ||
              relatedAction.attending
            )
          ) {
            var newParticipant = participantService.initParticipant(
              relatedAction,
              vm.page.contact
            );
            participantService.setDetectionResults(newParticipant);
            vm.page.relatedActionParticipants.push(newParticipant);
          }
        });

        var promises = syncRelatedActionParticipants();
        $q.all(promises).then(
          function(data) {
            if (vm.debug) {
              console.log('Section.RelatedActions: participants synced', data);
            }
            resolve(data);
          },
          function(err) {
            if (vm.debug) {
              console.log(
                'Section.Experience: error syncing participants',
                err
              );
            }
            reject(err);
          }
        );
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

    function setRelatedEventsAttending() {
      if (
        vm.section.relatedActionParticipantsExist === true &&
        vm.section.relatedActionsExist === true
      ) {
        if (DEBUG) {
          console.log(
            'Section.RelatedActions: setting attending',
            vm.page.relatedActions
          );
        }
        angular.forEach(
          vm.page.relatedActionParticipants,
          function(participant, i) {
            angular.forEach(
              vm.page.relatedActions,
              function(relatedAction, j) {
                if (
                  relatedAction.Id === participant.Action__c &&
                  participant.Status__c === 'Registered'
                ) {
                  relatedAction.attending = true;
                }
              }
            );
          }
        );
      }
    }

    // this function makes sure that all related action participants
    // have the same information as the participant for this action
    function syncRelatedActionParticipants() {
      if (DEBUG) {
        console.log(
          'Section.RelatedActions: syncRelatedActionParticipants'
        );
      }
      var promises = [];
      if (
        vm.page.relatedActionParticipants.length > 0 &&
        vm.page.participant.Id !== undefined
      ) {
        if (DEBUG) {
          console.log(
            'Section.RelatedActions: syncRelatedActionParticipants PAX',
            vm.page.relatedActionParticipants
          );
        }
        angular.forEach(
          vm.page.relatedActionParticipants,
          function(participant, index) {
            if (DEBUG) {
              console.log(
                'Section.RelatedActions: syncing participant',
                participant.Status__c
              );
            }
            participant.Prior_experience_with_action_topic__c
              = vm.page.participant.Prior_experience_with_action_topic__c;
            participant.Knowledge_they_would_like_to_gain__c
              = vm.page.participant.Knowledge_they_would_like_to_gain__c;
            participant.Skills_they_would_like_to_gain__c
              = vm.page.participant.Skills_they_would_like_to_gain__c;
            participant.Additional_information__c
              = vm.page.participant.Additional_information__c;
            participant.Organisation__c
              = vm.page.participant.Organisation__c;
            participant.Type__c
              = vm.page.participant.Type__c;
            participant.Registration_complete__c
              = vm.page.participant.Registration_complete__c;
            if (DEBUG) {
              console.log(
                'Section.RelatedActions: updatedParticipant',
                participant
              );
            }
            // save the participant
            promises.push(syncRelatedActionParticipant(participant));
          }
        );
      }
      return promises;
    }

    function syncRelatedActionParticipant(participant) {
      return $q(function(resolve, reject) {
        participantService.save(participant)
        .then(
          function(savedParticipant) {
            if (DEBUG) {
              console.log('Section.RelatedActions: participant saved');
            }
            resolve(savedParticipant);
          },
          function(err) {
            if (DEBUG) {
              console.log(
                'Section.RelatedActions: Error saving participant',
                err
              );
            }
            reject(err);
          }
        );
      });
    }
  }
})();
