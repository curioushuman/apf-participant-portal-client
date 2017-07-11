/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.registration')
    .config(configFunction);

  configFunction.$inject = ['$routeProvider'];

  function configFunction($routeProvider) {
    $routeProvider.when('/registration/:actionSlug', {
      templateUrl: 'scripts/registration/registration.view.html',
      controller: 'RegistrationController',
      controllerAs: 'vm'
    });
  }
})();
