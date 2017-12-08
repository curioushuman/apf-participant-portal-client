/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('actionService', actionService);

  actionService.$inject = [
    '$location',
    '$q',
    '$resource',
    '$routeParams',
    'gaService',
    'layoutService',
    'userService',
    'API_URI',
    'DEBUG'
  ];

  function actionService(
    $location,
    $q,
    $resource,
    $routeParams,
    gaService,
    layoutService,
    userService,
    API_URI,
    DEBUG
  ) {
    var Action = $resource(API_URI + '/action/:slug',
      {
        slug: '@slug'
      }
    );

    var service = {
      list: Action.query,
      retrieve: Action.get,
      retrieveAndInit: retrieveAndInit
    };

    function retrieveAndInit() {
      return $q(function(resolve, reject) {
        gaService.addSalesforceRequest('Retrieve', 'Action');
        Action.get(
          {
            slug: $routeParams.actionSlug
          },
          function(action) {
            gaService.addSalesforceResponse(
              'Retrieve',
              'Action'
            );
            action.loaded = true;

            // work out the correct start and end dates
            if (
              action.Start_date__c !== null
            ) {
              action.startDate =
                layoutService.formatDate(action.Start_date__c);
            }
            if (
              action.Finish_date__c !== null &&
              action.Finish_date__c !== action.Start_date__c
            ) {
              action.finishDate =
                layoutService.formatDate(action.Finish_date__c);
            }

            // see if there is a due date
            // first check for closed override
            if ($location.search().closed === 'override') {
              // do nothing, allow the form to open
              action.formStatus = 'open';
            } else if (action.Registrations_due_date__c) {
              // format accordingly
              action.registrationDate =
                layoutService.formatDate(action.Registrations_due_date__c);
              // determine if it has passed
              var registrationDate = new Date(action.Registrations_due_date__c);
              var nowDate = new Date();
              if (nowDate.getTime() > registrationDate.getTime()) {
                action.formStatus = 'closed';
              }
            } else {
              action.formStatus = 'closed';
            }

            // sort out the selection criteria
            if (action.Selection_criteria__c) {
              action.selectionCriteria =
                layoutService.listFromString(action.Selection_criteria__c);
            }

            if (action.Ideal_candidate__c) {
              action.idealCandidate =
                layoutService.listFromString(action.Ideal_candidate__c);
            }

            // is training an action?
            action.isTraining = false;
            if (action.RecordTypeId === '0126F000000iyY7QAI') {
              action.isTraining = true;
            }

            // ADD IN THE TRAINING PARTNER STUFF HERE

            resolve(action);
          },
          function(err) {
            gaService.addSalesforceError(
              'Retrieve',
              'Action',
              err.status
            );

            reject(err);
          }
        );
      });
    }

    return service;
  }
})();
