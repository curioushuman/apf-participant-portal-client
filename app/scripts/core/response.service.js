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
        if (response.Id === undefined) {
          if (DEBUG) {
            console.log('CREATING response record', response);
          }
          gaService.addSalesforceRequest('Create', 'Response');
          response.$save(
            function(record) {
              gaService.addSalesforceResponse(
                'Create',
                'Response'
              );
              if (record.success) {
                response.Id = record.Id;
                if (DEBUG) {
                  console.log('response Created', response);
                }
                resolve(response);
              } else {
                if (DEBUG) {
                  console.log('There was an error creating the response');
                }
                reject('There was an error creating the response');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create',
                'Response',
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
          gaService.addSalesforceRequest('Update', 'Response');
          response.$update(
            {
              responseid: response.Id
            },
            function(record) {
              gaService.addSalesforceResponse(
                'Update',
                'Response'
              );
              if (record.success) {
                if (DEBUG) {
                  console.log('response Updated', response);
                }
                resolve(response);
              } else {
                if (DEBUG) {
                  console.log('There was an error updating the response');
                }
                reject('There was an error updating the response');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Update',
                'Response',
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
