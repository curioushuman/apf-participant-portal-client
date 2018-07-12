/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzRelatedActionInput', gzRelatedActionInput);

  gzRelatedActionInput.$inject = [
    'layoutService'
  ];

  function gzRelatedActionInput(layoutService) {
    return {
      templateUrl: 'scripts/form/directives/relatedActionInput.template.html',
      restrict: 'E',
      controller: RelatedActionInputController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        relatedAction: '='
      }
    };
  }

  RelatedActionInputController.$inject = [
    'layoutService'
  ];

  function RelatedActionInputController(
    layoutService
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;
  }
})();
