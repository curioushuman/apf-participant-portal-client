/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzCompleteSection', gzCompleteSection);

  gzCompleteSection.$inject = [
    'layoutService'
  ];

  function gzCompleteSection(layoutService) {
    return {
      templateUrl:
        'scripts/form/directives/completeSection.template.html',
      restrict: 'E',
      controller: CompleteSectionController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        title: '='
      }
    };
  }

  CompleteSectionController.$inject = [
    'layoutService'
  ];

  function CompleteSectionController(
    layoutService
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;
  }
})();
