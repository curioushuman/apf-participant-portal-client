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
        page: '=',
        form: '='
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

    $scope.$watch('vm.page.sectionsEnabled', function(value) {
      if (vm.page.sectionsEnabled === true) {
        if (DEBUG) {
          console.log('sectionsEnabled');
        }
        vm.section.complete = false;
        vm.section.error = false;
        vm.section.invalid = false;
        vm.sectionNext = false;
        vm.sectionPrevious = false;
        var nextSectionDisabled = false;
        var lastEnabledSection = null;
        angular.forEach(vm.page.sections, function(section, index) {
          if (vm.sectionNext === false) {
            if (
              nextSectionDisabled === true &&
              section.enabled === true
            ) {
              // grab the first enabled section after what would have been next
              vm.sectionNext = vm.page.sections[section.id];
            } else if (
              section.id === vm.section.next
            ) {
              if (section.enabled === true) {
                // next is enabled, all good
                vm.sectionNext = vm.page.sections[section.id];
              } else {
                // next not enabled, refer to above step in the logic
                nextSectionDisabled = true;
              }
            }
          }
          if (vm.sectionPrevious === false) {
            if (
              section.next === vm.section.id &&
              section.enabled === true
            ) {
              vm.sectionPrevious = vm.page.sections[section.id];
            } else if (
              section.next === vm.section.id &&
              section.enabled === false
            ) {
              vm.sectionPrevious = vm.page.sections[lastEnabledSection.id];
            }
          }
          if (section.enabled === true) {
            lastEnabledSection = section;
          }
        });
        if (DEBUG) {
          console.log('Init section', vm.section);
        }
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
      if (
        vm.section.required !== undefined &&
        isValid(vm.section.required) === false
      ) {
        vm.section.invalid = true;
        return;
      }

      vm.page.working = true;

      vm.section.process()
      .then(
        function(result) {
          vm.section.complete = true;
          if (vm.sectionNext !== false) {
            vm.sectionNext.sectionCtrl.pre();
          } else {
            vm.page.complete();
          }
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

    function isValid(requiredFields) {
      var valid = true;
      console.log(vm.form);
      angular.forEach(requiredFields, function(field, index) {
        if (vm.form[field].$invalid) {
          valid = false;
          vm.form[field].$setTouched();
        }
      });

      return valid;
    }
  }
})();
