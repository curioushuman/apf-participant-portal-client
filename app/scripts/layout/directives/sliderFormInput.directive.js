/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('gzSliderFormInput', gzSliderFormInput);

  gzSliderFormInput.$inject = [
    'layoutService'
  ];

  function gzSliderFormInput(layoutService) {
    return {
      templateUrl: 'scripts/layout/directives/sliderFormInput.template.html',
      restrict: 'E',
      controller: SliderFormInputController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        question: '@',
        model: '=',
        name: '@',
        error: '='
      }
    };
  }

  SliderFormInputController.$inject = [
    'layoutService'
  ];

  function SliderFormInputController(
    layoutService
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;
  }
})();
