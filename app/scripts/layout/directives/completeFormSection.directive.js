/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('gzCompleteFormSection', gzCompleteFormSection);

  gzCompleteFormSection.$inject = [
    'layoutService'
  ];

  function gzCompleteFormSection(layoutService) {
    return {
      templateUrl:
        'scripts/layout/directives/completeFormSection.template.html',
      restrict: 'E',
      controller: CompleteFormSectionController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        title: '='
      }
    };
  }

  CompleteFormSectionController.$inject = [
    'layoutService'
  ];

  function CompleteFormSectionController(
    layoutService
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;
  }
})();
