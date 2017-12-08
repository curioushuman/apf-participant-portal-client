/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSection', gzSection);

  gzSection.$inject = [
    'layoutService'
  ];

  function gzSection(layoutService) {
    return {
      templateUrl:
        'scripts/form/directives/section.template.html',
      restrict: 'E',
      transclude: true,
      controller: SectionController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {

      }
    };
  }

  SectionController.$inject = [
    '$scope',
    'layoutService',
    'DEBUG'
  ];

  function SectionController(
    $scope,
    layoutService,
    DEBUG
  ) {
    var vm = this;
    vm.show = false;
    vm.section = null;

    $scope.$watch('vm.section', function(value) {
      console.log('section', vm.section);
    });

  }
})();
