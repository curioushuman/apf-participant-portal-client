/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('participantService', participantService);

  participantService.$inject = [
    '$q',
    '$resource',
    'detectionService',
    'gaService',
    'API_URI',
    'DEBUG'
  ];

  function participantService(
    $q,
    $resource,
    detectionService,
    gaService,
    API_URI,
    DEBUG
  ) {
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
        },
        queryRelatedAction: {
          method: 'GET',
          url: API_URI + '/participant/related_action/:contactid/:actionid',
          params: {
            contactid: '@contactid',
            actionid: '@actionid'
          },
          isArray: true
        }
      }
    );

    var service = {
      Participant: Participant,
      retrieve: Participant.get,
      listByRelatedAction: Participant.queryRelatedAction,
      setDetectionResults: setDetectionResults,
      initParticipant: initParticipant,
      save: save
    };

    return service;

    function setDetectionResults(participant) {
      if (
        participant.Connection_speed_Mbps__c === undefined &&
        detectionService.connectionResults.speedBps > 0
      ) {
        participant.Connection_speed_Mbps__c =
          detectionService.connectionResults.speedMbps;
        participant.Technology_browser__c =
          detectionService.platformResults.browser;
        participant.Technology_operating_system__c =
          detectionService.platformResults.os;
        participant.Technology_screen_resolution__c =
          detectionService.platformResults.resolution;
        return true;
      }
      return false;
    }

    function initParticipant(action, contact) {
      return new Participant(
        {
          Contact__c: contact.Id,
          Type__c: 'Participant',
          Registration_complete__c: false,
          Action__c: action.Id,
          Status__c: 'Registered',
          exists: false
        }
      );
    }

    function save(participant) {
      if (DEBUG) {
        console.log('Saving participant', participant);
      }
      return $q(function(resolve, reject) {
        if (
          participant.Id === undefined ||
          participant.Id === null
        ) {
          if (DEBUG) {
            console.log('CREATING participant record');
          }
          gaService.addSalesforceRequest('Create', 'Participant');
          participant.$save(
            function(record) {
              gaService.addSalesforceResponse(
                'Create',
                'Participant'
              );
              if (record.success) {
                if (DEBUG) {
                  console.log('participant Created');
                }
                participant.Id = record.Id;
                resolve(participant);
              } else {
                if (DEBUG) {
                  console.log('There was an error creating the participant');
                }
                reject('There was an error creating the participant');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create',
                'Participant',
                err.status
              );
              if (DEBUG) {
                console.log('There was an error creating the participant', err);
              }
              reject(err);
            }
          );
        } else {
          if (DEBUG) {
            console.log('UPDATING participant record');
          }
          gaService.addSalesforceRequest('Update', 'Participant');
          participant.$update(
            {
              participantid: participant.Id
            },
            function(record) {
              gaService.addSalesforceResponse(
                'Update',
                'Participant'
              );
              if (record.success) {
                if (DEBUG) {
                  console.log('participant Updated');
                }
                resolve(participant);
              } else {
                if (DEBUG) {
                  console.log('There was an error updating the participant');
                }
                reject('There was an error updating the participant');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Update',
                'Participant',
                err.status
              );
              if (DEBUG) {
                console.log('There was an error updating the participant', err);
              }
              reject(err);
            }
          );
        }
      });
    }
  }
})();
