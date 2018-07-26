/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('responseService', responseService);

  responseService.$inject = [
    '$q',
    '$resource',
    'gaService',
    'API_URI',
    'DEBUG'
  ];

  function responseService(
    $q,
    $resource,
    gaService,
    API_URI,
    DEBUG
  ) {
    var Response = $resource(API_URI + '/response',
      {},
      {
        query: {
          method: 'GET',
          url: API_URI + '/response/:participantid',
          params: {
            participantid: '@participantid'
          },
          isArray: true
        },
        get: {
          method: 'GET',
          url: API_URI + '/response/:participantid/:questionid',
          params: {
            participantid: '@participantid',
            questionid: '@questionid'
          }
        },
        update: {
          method: 'PUT',
          url: API_URI + '/response/:responseid',
          params: {
            responseid: '@responseid'
          }
        }
      }
    );

    var service = {
      Response: Response,
      list: Response.query,
      retrieve: Response.get,
      save: save
    };

    return service;

    function save(response) {
      if (DEBUG) {
        console.log('Saving response', response);
      }
      return $q(function(resolve, reject) {
        if (
          response.Id === undefined ||
          response.Id === null
        ) {
          if (DEBUG) {
            console.log('CREATING response record', response);
          }
          gaService.addSalesforceRequest('Create Response', 'New Response');
          response.$save(
            function(record) {
              if (record.success) {
                response.Id = record.Id;
                if (DEBUG) {
                  console.log('response Created', response);
                }
                gaService.addSalesforceResponse(
                  'Create Response',
                  record.Id
                );
                resolve(response);
              } else {
                if (DEBUG) {
                  console.log('There was an error creating the response');
                }
                gaService.addSalesforceError(
                  'Create Response',
                  'New Response',
                  'No error status'
                );
                reject('There was an error creating the response');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create Response',
                'New Response',
                err.status
              );
              if (DEBUG) {
                console.log('There was an error creating the response', err);
              }
              reject(err);
            }
          );
        } else {
          if (DEBUG) {
            console.log('UPDATING response record', response);
          }
          gaService.addSalesforceRequest('Update Response', response.Id);
          response.$update(
            {
              responseid: response.Id
            },
            function(record) {
              if (record.success) {
                if (DEBUG) {
                  console.log('response Updated', response);
                }
                gaService.addSalesforceResponse(
                  'Update Response',
                  response.Id
                );
                resolve(response);
              } else {
                if (DEBUG) {
                  console.log('There was an error updating the response');
                }
                gaService.addSalesforceError(
                  'Update Response',
                  response.Id,
                  'No error status'
                );
                reject('There was an error updating the response');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Update Response',
                response.Id,
                err.status
              );
              if (DEBUG) {
                console.log('There was an error updating the response', err);
              }
              reject(err);
            }
          );
        }
      });
    }
  }
})();
