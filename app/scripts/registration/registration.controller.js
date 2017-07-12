/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.registration')
    .controller('RegistrationController', RegistrationController);

  RegistrationController.$inject = [
    '$routeParams',
    '$location',
    'layoutService',
    'actionService',
    'contactService',
    'accountService',
    'affiliationService',
    'participantService',
    'questionService',
    'responseService'
  ];

  function RegistrationController(
    $routeParams,
    $location,
    layoutService,
    actionService,
    contactService,
    accountService,
    affiliationService,
    participantService,
    questionService,
    responseService
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;

    vm.actionLoaded = false;
    vm.actionError = false;
    vm.actionErrorMessage = {};
    vm.formShow = false;

    vm.action = actionService.retrieve(
      { slug: $routeParams.actionSlug },
      function () {
        console.log('retrieved');
        console.log(vm.action);
        vm.actionLoaded = true;

        console.log('Obtain training partner');
        console.log(vm.action.Training_partner__c);
        vm.action.trainingPartnerAccount = accountService.retrieve(
          { accountid: vm.action.Training_partner__c },
          function () {
            console.log('Found the training partner');
          },
          function (err) {
            console.log('Training partner could not be found');
          }
        );
      },
      function (err) {
        console.log(err);
        if (err.status = 404) {
          vm.actionErrorMessage = {
            title: 'No action found',
            message: 'Please check URL'
          };
        } else {
          vm.actionErrorMessage = {
            title: 'Error at server',
            message: 'Please reload the page'
          };
        }
        vm.actionError = true;
      }
    );

    // let's attemt to obtain the action from the slug
    console.log($routeParams);

  }
})();
