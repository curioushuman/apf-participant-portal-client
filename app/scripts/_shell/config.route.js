/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.contacts')
    .config(configFunction);

  configFunction.$inject = ['$routeProvider'];

  function configFunction($routeProvider) {
    $routeProvider.when('/contacts', {
      templateUrl: 'scripts/contacts/contacts.view.html',
      controller: 'ContactsController',
      controllerAs: 'vm'
    });
  }
})();
