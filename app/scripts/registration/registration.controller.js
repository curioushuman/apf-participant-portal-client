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

    // find the action based on the slug
    vm.action = actionService.retrieve(
      { slug: $routeParams.actionSlug },
      function () {
        console.log('retrieved');
        console.log(vm.action);
        vm.actionLoaded = true;

        // work out the correct start and end dates
        vm.action.datesShow = false;
        if (vm.action.Digital_component__c === true) {
          vm.action.startDate = vm.action.Digital_start_date__c;
        } else {
          vm.action.startDate = vm.action.Face_to_face_start_date__c;
        }
        if (vm.action.Face_to_face_component__c === true) {
          vm.action.finishDate = vm.action.Face_to_face_finish_date__c;
        } else {
          vm.action.finishDate = vm.action.Digital_finish_date__c;
        }
        if (vm.action.startDate !== null && vm.action.finishDate !== null) {
          vm.action.datesShow = true;
          vm.action.startDate = layoutService.formatDate(vm.action.startDate);
          vm.action.finishDate = layoutService.formatDate(vm.action.finishDate);
        }

        // grab the training partner of the action
        console.log('Obtain training partner');
        console.log(vm.action.Training_partner__c);
        vm.action.trainingPartnerAccount = accountService.retrieve(
          { accountid: vm.action.Training_partner__c },
          function () {
            console.log('Found the training partner');
            console.log(vm.action.trainingPartnerAccount);
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

  }
})();
