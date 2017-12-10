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
        page: '='
      }
    };
  }

  SectionController.$inject = [
    '$filter',
    '$scope',
    'gaService',
    'layoutService',
    'DEBUG'
  ];

  function SectionController(
    $filter,
    $scope,
    gaService,
    layoutService,
    DEBUG
  ) {
    var vm = this;
    vm.section = null;
    vm.sectionNext = null;

    $scope.$watch('vm.section', function(value) {
      if (vm.section !== null) {
        vm.section.complete = false;
        vm.section.error = false;
        vm.section.invalid = false;
        vm.sectionNext = vm.page.sections[vm.section.next];
        vm.sectionPrevious = false;
        angular.forEach(vm.page.sections, function(section, index) {
          if (section.next === vm.section.id) {
            vm.sectionPrevious = vm.page.sections[section.id];
          }
        });
        console.log('Init section', vm.section);
      }
    });

    vm.pre = function() {
      vm.section.pre()
      .then(
        function(result) {
          if (DEBUG) {
            console.log('Doing pre things');
          }
          editSection();
        },
        function(err) {
          // do nothing (FOR NOW)
        }
      );
    };

    vm.process = function() {
      vm.section.process()
      .then(
        function(result) {
          vm.section.complete = true;
          vm.sectionNext.sectionCtrl.pre();
        },
        function(err) {
          vm.page.working = false;
          vm.section.error = true;
          if (DEBUG) {
            console.log('Error: ' + vm.section.id, err);
          }
        }
      );
    };

    vm.previous = function() {
      vm.page.working = true;
      vm.sectionPrevious.sectionCtrl.pre();
    };

    function editSection(source) {
      vm.page.currentSection = vm.section.id;
      // layoutService.navigate(null, vm.section.id);
      layoutService.navigate(null, 'top');

      // adding event
      if (source === undefined) {
        gaService.addEvent('Navigation', 'Section, next', vm.section.id);
      } else {
        gaService.addEvent('Navigation', 'Section, ' + source, vm.section.id);
      }
    }
    vm.editSection = editSection;
  }
})();
