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
    'actionService'
  ];

  function LandingController(
    $location,
    layoutService,
    actionService
  ) {
    var vm = this;

    actionService.actions()
      .$promise.then(function(actions) {
        console.log(actions);
      });

    vm.navigate = layoutService.navigate;
  }
})();
