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
    '$q',
    '$resource',
    'gaService',
    'API_URI',
    'DEBUG'
  ];

  function sessionParticipationService(
    $q,
    $resource,
    gaService,
    API_URI,
    DEBUG
  ) {
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
      retrieve: SessionParticipation.get,
      save: save
    };

    return service;

    function save(sessionParticipation) {
      if (DEBUG) {
        console.log('Saving sessionParticipation', sessionParticipation);
      }
      return $q(function(resolve, reject) {
        if (
          sessionParticipation.Id === undefined ||
          sessionParticipation.Id === null
        ) {
          if (DEBUG) {
            console.log(
              'CREATING sessionParticipation record',
              sessionParticipation
            );
          }
          gaService.addSalesforceRequest('Create', 'SessionParticipation');
          sessionParticipation.$save(
            function(record) {
              gaService.addSalesforceResponse(
                'Create',
                'SessionParticipation'
              );
              if (record.success) {
                sessionParticipation.Id = record.Id;
                if (DEBUG) {
                  console.log(
                    'sessionParticipation Created',
                    sessionParticipation
                  );
                }
                resolve(sessionParticipation);
              } else {
                if (DEBUG) {
                  console.log(
                    'There was an error creating the sessionParticipation'
                  );
                }
                reject('There was an error creating the sessionParticipation');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create',
                'SessionParticipation',
                err.status
              );
              if (DEBUG) {
                console.log(
                  'There was an error creating the sessionParticipation',
                  err
                );
              }
              reject(err);
            }
          );
        } else {
          if (DEBUG) {
            console.log(
              'UPDATING sessionParticipation record',
              sessionParticipation
            );
          }
          gaService.addSalesforceRequest('Update', 'SessionParticipation');
          sessionParticipation.$update(
            {
              sessionParticipationid: sessionParticipation.Id
            },
            function(record) {
              gaService.addSalesforceResponse(
                'Update',
                'SessionParticipation'
              );
              if (record.success) {
                if (DEBUG) {
                  console.log(
                    'sessionParticipation Updated',
                    sessionParticipation
                  );
                }
                resolve(sessionParticipation);
              } else {
                if (DEBUG) {
                  console.log(
                    'There was an error updating the sessionParticipation'
                  );
                }
                reject('There was an error updating the sessionParticipation');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Update',
                'SessionParticipation',
                err.status
              );
              if (DEBUG) {
                console.log(
                  'There was an error updating the sessionParticipation',
                  err
                );
              }
              reject(err);
            }
          );
        }
      });
    }
  }
})();
