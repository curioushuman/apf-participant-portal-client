/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('gzResponseFormInput', gzResponseFormInput);

  gzResponseFormInput.$inject = [
    'layoutService'
  ];

  function gzResponseFormInput(layoutService) {
    return {
      templateUrl: 'scripts/layout/directives/responseFormInput.template.html',
      restrict: 'E',
      controller: ResponseFormInputController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        question: '=',
        index: '='
      }
    };
  }

  ResponseFormInputController.$inject = [
    'layoutService'
  ];

  function ResponseFormInputController(
    layoutService
  ) {
    var vm = this;

    vm.hideComment = true;
    vm.showComment = showComment;

    vm.navigate = layoutService.navigate;

    function showComment() {
      vm.hideComment = false;
    }
  }
})();
