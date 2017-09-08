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
        question: '='
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

    vm.type = vm.question.Type__c;
    vm.hideComment = true;
    if (vm.question.Type__c === 'Comment only') {
      vm.hideComment = false;
      vm.question.response.Score__c = 0;
      vm.question.response.NoScore = true;
    }
    vm.showComment = showComment;

    vm.navigate = layoutService.navigate;

    function showComment() {
      vm.hideComment = false;
    }
  }
})();
