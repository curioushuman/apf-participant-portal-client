/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzResponseInput', gzResponseInput);

  gzResponseInput.$inject = [
    'layoutService'
  ];

  function gzResponseInput(layoutService) {
    return {
      templateUrl: 'scripts/form/directives/responseInput.template.html',
      restrict: 'E',
      controller: ResponseInputController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        question: '='
      }
    };
  }

  ResponseInputController.$inject = [
    'layoutService'
  ];

  function ResponseInputController(
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
