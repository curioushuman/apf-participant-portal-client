/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzDisabledSection', gzDisabledSection);

  gzDisabledSection.$inject = [
    'layoutService'
  ];

  function gzDisabledSection(layoutService) {
    return {
      templateUrl:
        'scripts/form/directives/disabledSection.template.html',
      restrict: 'E',
      controller: DisabledSectionController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        title: '='
      }
    };
  }

  DisabledSectionController.$inject = [
    'layoutService'
  ];

  function DisabledSectionController(
    layoutService
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;
  }
})();
