/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('gzNavbar', gzNavbar);

  gzNavbar.$inject = [
    'layoutService'
  ];

  function gzNavbar(layoutService) {
    return {
      templateUrl: 'scripts/layout/directives/navbar.template.html',
      restrict: 'E',
      controller: NavbarController,
      controllerAs: 'vm',
      link: function(scope) {
        scope.player = layoutService.player;
      }
    };
  }

  NavbarController.$inject = [
    'layoutService'
  ];

  function NavbarController(
    layoutService
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;
  }
})();
