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
        form: '='
      }
    };
  }

  SectionController.$inject = [
    '$scope',
    'gaService',
    'layoutService',
    'DEBUG'
  ];

  function SectionController(
    $scope,
    gaService,
    layoutService,
    DEBUG
  ) {
    var vm = this;
    vm.show = false;
    vm.section = null;

    $scope.$watch('vm.section', function(value) {
      if (vm.section === null) {
        return;
      }
      if (vm.form.currentSection === vm.section.id) {
        vm.section.status = 'active';
      } else if (vm.section.complete === true) {
        vm.section.status = 'complete';
      } else {
        vm.section.status = 'disabled';
      }
      console.log('section', vm.section);
    });

    vm.editSection = function(source) {
      vm.form.currentSection = vm.section.id;
      // layoutService.navigate(null, section);
      layoutService.navigate(null, 'top');

      // adding event
      if (source === undefined) {
        gaService.addEvent('Navigation', 'Section, next', section);
      } else {
        gaService.addEvent('Navigation', 'Section, ' + source, section);
      }
    }

  }
})();
