/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzProgressBar', gzProgressBar);

  gzProgressBar.$inject = [

  ];

  function gzProgressBar() {
    return {
      templateUrl: 'scripts/form/directives/progressBar.template.html',
      restrict: 'E',
      controller: ProgressBarController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        progress: '='
      }
    };
  }

  ProgressBarController.$inject = [
    '$scope'
  ];

  function ProgressBarController(
    $scope
  ) {
    var vm = this;

    vm.percentage = 0;

    $scope.$watch('vm.progress.total', function(value) {
      if (typeof vm.progress === 'object') {
        vm.percentage =
          Math.round(vm.progress.complete / vm.progress.total * 100);
      }
    });
  }
})();
