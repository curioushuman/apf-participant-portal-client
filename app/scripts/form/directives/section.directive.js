/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSection', gzSection);

  gzSection.$inject = [

  ];

  function gzSection() {
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
    vm.section = null;
    vm.sectionNext = null;

    $scope.$watch('vm.page.sectionsEnabled', function(value) {
      if (vm.page.sectionsEnabled === true) {
        if (DEBUG) {
          console.log('sectionsEnabled');
        }

        // init the current section
        vm.section.complete = false;
        vm.section.errorInitial = false;
        vm.section.error = false;
        vm.section.errors = {};
        vm.section.processing = {
          processes: 0,
          processing: 1
        };
        vm.section.invalid = false;

        // work out what sections are previous and next
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

    vm.pre = function(source) {
      if (
        source !== undefined &&
        typeof source === 'string'
      ) {
        gaService.addEvent('Navigation', 'Section, ' + source, vm.section.id);
      }

      // call the section pre function
      vm.section.pre()
      .then(
        function(result) {
          if (DEBUG) {
            console.log('Done section pre things');
          }

          // then open the section
          vm.page.working = false;
          editSection();
        },
        function(err) {
          // if there is an error, show the section anyway
          // so the error can be seen
          if (vm.section.errorInitial) {
            vm.page.working = false;
            editSection();
          }
        }
      );
    };

    vm.process = function() {

      // reset errors
      vm.section.error = false;
      vm.section.invalid = false;

      // validate the section
      if (
        vm.section.required !== undefined &&
        vm.section.required.length > 0 &&
        isValid(vm.section.required) === false
      ) {
        vm.section.invalid = true;
        return;
      }

      // special validation for sliders
      // this could be handled better
      // i.e. to not be so necessarily tied to contact
      if (
        vm.section.requiredSliders !== undefined &&
        vm.section.requiredSliders.length > 0
      ) {
        angular.forEach(vm.section.requiredSliders, function(slider, index) {
          if (
            vm.page.contact[slider] === undefined ||
            vm.page.contact[slider] === null ||
            vm.page.contact[slider] === 0
          ) {
            vm.section.errors[slider] = true;
            vm.section.invalid = true;
          } else {
            vm.section.errors[slider] = false;
          }
        });

        if (vm.section.invalid === true) {
          return;
        }
      }

      // indicate we're thinking about it
      vm.page.working = true;

      // call the section process function
      vm.section.process()
      .then(
        function(result) {
          // mark the section as complete, and move to the next section
          // or simply complete the form
          vm.section.complete = true;
          if (vm.sectionNext !== false) {
            vm.sectionNext.sectionCtrl.pre();
          } else {
            vm.page.complete();
          }
        },
        function(err) {
          // stop thinking about it, show the error
          vm.page.working = false;
          if (vm.section.invalid !== true) {
            vm.section.error = true;
          }
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
      if (DEBUG) {
        console.log('editSection', vm.section.id);
      }
      vm.page.currentSection = vm.section.id;
      // this is problematic, it won't anchor to the right point
      // layoutService.navigate(null, vm.section.id);
      layoutService.navigate(null, 'top');

      // adding GA event
      if (source === undefined) {
        gaService.addEvent('Navigation', 'Section, next', vm.section.id);
      } else {
        gaService.addEvent('Navigation', 'Section, ' + source, vm.section.id);
      }
    }
    vm.editSection = editSection;

    function isValid(requiredFields) {
      var valid = true;
      angular.forEach(requiredFields, function(field, index) {
        if (vm.form[field].$invalid) {
          if (DEBUG) {
            console.log('Invalid', field);
            console.log('Field', vm.form[field]);
          }
          valid = false;
          vm.form[field].$setTouched();
        }
      });

      return valid;
    }
    vm.isValid = isValid;
  }
})();
