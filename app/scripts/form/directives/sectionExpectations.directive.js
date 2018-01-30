/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionExpectations', gzSectionExpectations);

  gzSectionExpectations.$inject = [

  ];

  function gzSectionExpectations() {
    return {
      require: '^^gzSection',
      controller: SectionExpectationsController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/form/directives/sectionExpectations.template.html',
      restrict: 'E',
      scope: {
        page: '=',
        form: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.expectations;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  SectionExpectationsController.$inject = [
    '$q',
    'participantService',
    'DEBUG'
  ];

  function SectionExpectationsController(
    $q,
    participantService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.expectations;
    vm.section.requestTime = {};
    vm.section.required = [
      'participantKnowledgeGain',
      'participantSkillsGain'
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
              console.log('Section.Expectations: Participant saved');
            }
            resolve(participant);
          },
          function(err) {
            if (DEBUG) {
              console.log(
                'Section.Expectations: Error saving participant',
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
