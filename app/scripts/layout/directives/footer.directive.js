/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('gzFooter', gzFooter);

  gzFooter.$inject = [
    'layoutService'
  ];

  function gzFooter(layoutService) {
    return {
      templateUrl: 'scripts/layout/directives/footer.template.html',
      restrict: 'E',
      controller: FooterController,
      controllerAs: 'vm'
    };
  }

  FooterController.$inject = [
    'layoutService'
  ];

  function FooterController(
    layoutService
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;
  }
})();
