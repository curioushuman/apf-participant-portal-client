/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSliderInput', gzSliderInput);

  gzSliderInput.$inject = [
    'layoutService'
  ];

  function gzSliderInput(layoutService) {
    return {
      templateUrl: 'scripts/form/directives/sliderInput.template.html',
      restrict: 'E',
      controller: SliderInputController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        question: '@',
        model: '=',
        name: '@',
        error: '=',
        focus: '@'
      }
    };
  }

  SliderInputController.$inject = [
    'layoutService'
  ];

  function SliderInputController(
    layoutService
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;
  }
})();
