/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('gzSupportingText', gzSupportingText);

  gzSupportingText.$inject = [
    'layoutService'
  ];

  function gzSupportingText(layoutService) {
    return {
      templateUrl:
        'scripts/layout/directives/supportingText.template.html',
      restrict: 'E',
      controller: SupportingTextController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        content: '=',
        title: '@',
        display: '@',
        list: '@'
      }
    };
  }

  SupportingTextController.$inject = [
    '$scope',
    'layoutService',
    'DEBUG'
  ];

  function SupportingTextController(
    $scope,
    layoutService,
    DEBUG
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;

    $scope.$watch('vm.content', function(value) {
      if (value !== undefined && vm.display === 'list') {
        vm.list = layoutService.listFromString(value);
      }
    });
  }
})();
