/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.landing')
    .controller('LandingController', LandingController);

  LandingController.$inject = [
    '$location'
  ];

  function LandingController(
    $location
  ) {
    var vm = this;

    // for now simply redirecting to registration
    // ACTUALLY unecessary as it has been handled by routeProvider
    // as it should be
    // $location.path('/registration');
  }
})();
