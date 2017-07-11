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

    vm.actionLoading = true;
    vm.formShow = false;

    vm.navigate = layoutService.navigate;

    // let's attemt to obtain the action from the slug
    console.log($routeParams);

  }
})();
