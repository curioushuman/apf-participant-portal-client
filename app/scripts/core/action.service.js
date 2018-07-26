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
    API_URI,
    DEBUG
  ) {
    var Action = $resource(API_URI + '/action/:slug',
      {
        slug: '@slug'
      },
      {
        queryRelatedAction: {
          method: 'GET',
          url: API_URI + '/action/related_action/:actionid',
          params: {
            actionid: '@actionid'
          },
          isArray: true
        }
      }
    );

    var service = {
      list: Action.query,
      listByRelatedAction: Action.queryRelatedAction,
      retrieve: Action.get,
      retrieveAndInit: retrieveAndInit
    };

    function retrieveAndInit() {
      return $q(function(resolve, reject) {
        if ($routeParams.actionSlug === 'none-specified') {
          var err = {
            status: 404
          };
          reject(err);
          return;
        }
        gaService.addSalesforceRequest(
          'Retrieve Action',
          $routeParams.actionSlug
        );
        Action.get(
          {
            slug: $routeParams.actionSlug
          },
          function(action) {
            gaService.addSalesforceResponse(
              'Retrieve Action',
              $routeParams.actionSlug
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
            action.formStatus = 'closed';
            if ($location.search().closed === 'override') {
              // do nothing, allow the form to open
              action.formStatus = 'open';
            }

            if (action.Registrations_due_date__c) {
              // format accordingly
              action.registrationDate =
                layoutService.formatDate(action.Registrations_due_date__c);
              // determine if it has passed
              var registrationDate = new Date(action.Registrations_due_date__c);
              var nowDate = new Date();
              if (registrationDate.getTime() > nowDate.getTime()) {
                action.formStatus = 'open';
              }
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
              'Retrieve Action',
              $routeParams.actionSlug,
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
