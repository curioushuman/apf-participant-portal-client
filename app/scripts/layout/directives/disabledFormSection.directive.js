/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('gzDisabledFormSection', gzDisabledFormSection);

  gzDisabledFormSection.$inject = [
    'layoutService'
  ];

  function gzDisabledFormSection(layoutService) {
    return {
      templateUrl: 'scripts/layout/directives/disabledFormSection.template.html',
      restrict: 'E',
      controller: DisabledFormSectionController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        title: '='
      }
    };
  }

  DisabledFormSectionController.$inject = [
    'layoutService'
  ];

  function DisabledFormSectionController(
    layoutService
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;
  }
})();
