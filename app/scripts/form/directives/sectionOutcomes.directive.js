/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionOutcomes', gzSectionOutcomes);

  gzSectionOutcomes.$inject = [

  ];

  function gzSectionOutcomes() {
    return {
      require: '^^gzSection',
      controller: SectionOutcomesController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/form/directives/sectionOutcomes.template.html',
      restrict: 'E',
      scope: {
        page: '=',
        form: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.outcomes;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  SectionOutcomesController.$inject = [
    '$q',
    'participantService',
    'DEBUG'
  ];

  function SectionOutcomesController(
    $q,
    participantService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.outcomes;
    vm.section.requestTime = {};
    vm.section.required = [
      'participantOutcomes'
    ];

    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        resolve(true);
      });
    };

    vm.section.process = function() {
      return $q(function(resolve, reject) {
        participantService.save(vm.page.participant)
        .then(
          function(participant) {
            if (DEBUG) {
              console.log('Section.Outcomes: Participant saved');
            }
            resolve(participant);
          },
          function(err) {
            if (DEBUG) {
              console.log(
                'Section.Outcomes: Error saving participant',
                err
              );
            }
            reject(err);
          }
        );
      });
    };
  }
})();
