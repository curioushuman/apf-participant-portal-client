/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.landing')
    .controller('LandingController', LandingController);

  LandingController.$inject = [
    '$location',
    'layoutService',
    'actionService',
    'contactService',
    'accountService',
    'affiliationService',
    'participantService'
  ];

  function LandingController(
    $location,
    layoutService,
    actionService,
    contactService,
    accountService,
    affiliationService,
    participantService
  ) {
    var vm = this;

    // actionService.list()
    //   .$promise.then(function(actions) {
    //     console.log(actions);
    //   });

    actionService.retrieve({ slug: '2017-test_training'})
      .$promise.then(function(action) {
        console.log(action);
      });

    // contactService.retrieve({ email: 'mike@curioushuman.com.au'})
    //   .$promise.then(function(contact) {
    //     console.log(contact);
    //   });

    // accountService.list()
    //   .$promise.then(function(account) {
    //     console.log(account);
    //   });

    // FINISH
    affiliationService.retrieve({
        contactid: '0036F000022A3fGQAS',
        accountid: '0016F00001qccTfQAI'
      })
      .$promise.then(function(affiliation) {
        console.log(affiliation);
      });

    // FINISH
    participantService.retrieve({
        contactid: '0036F000022A3fGQAS',
        actionid: 'a0m6F00000FxzWhQAJ'
      })
      .$promise.then(function(participant) {
        console.log(participant);
      });

    vm.navigate = layoutService.navigate;
  }
})();
