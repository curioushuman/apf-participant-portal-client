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
    'contactService'
  ];

  function LandingController(
    $location,
    layoutService,
    actionService,
    contactService
  ) {
    var vm = this;

    // actionService.list()
    //   .$promise.then(function(actions) {
    //     console.log(actions);
    //   });

    // actionService.retrieve({ slug: '2017-test_training'})
    //   .$promise.then(function(action) {
    //     console.log(action);
    //   });

    contactService.retrieve({ email: 'mike@curioushuman.com.au'})
      .$promise.then(function(contact) {
        console.log(contact);
      });

    vm.navigate = layoutService.navigate;
  }
})();
