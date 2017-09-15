/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('gzSupportingText', gzSupportingText);

  gzSupportingText.$inject = [
    'layoutService'
  ];

  function gzSupportingText(layoutService) {
    return {
      templateUrl:
        'scripts/layout/directives/supportingText.template.html',
      restrict: 'E',
      controller: SupportingTextController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        content: '=',
        title: '@',
        list: '='
      }
    };
  }

  SupportingTextController.$inject = [
    'layoutService',
    'DEBUG'
  ];

  function SupportingTextController(
    layoutService,
    DEBUG
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;
  }
})();
