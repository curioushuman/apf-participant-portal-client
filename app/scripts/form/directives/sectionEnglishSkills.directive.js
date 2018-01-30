/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionEnglishSkills', gzSectionEnglishSkills);

  gzSectionEnglishSkills.$inject = [

  ];

  function gzSectionEnglishSkills() {
    return {
      require: '^^gzSection',
      controller: SectionEnglishSkillsController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/form/directives/sectionEnglishSkills.template.html',
      restrict: 'E',
      scope: {
        page: '=',
        form: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.english_skills;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  SectionEnglishSkillsController.$inject = [
    '$q',
    'contactService',
    'DEBUG'
  ];

  function SectionEnglishSkillsController(
    $q,
    contactService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.english_skills;
    vm.section.requestTime = {};
    vm.section.required = [];
    vm.section.requiredSliders = [
      'EN_Skills_Ability_to_read_in_English__c',
      'EN_Skills_Ability_to_write_in_English__c',
      'EN_Skills_Ability_to_understand_spoken__c',
      'EN_Skills_Ability_to_speak_English__c'
    ];

    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        resolve(true);
      });
    };

    vm.section.process = function() {
      return $q(function(resolve, reject) {
        contactService.save(vm.page.contact)
        .then(
          function(contact) {
            if (DEBUG) {
              console.log('Section.English_Skills: Contact saved');
            }
            resolve(contact);
          },
          function(err) {
            if (DEBUG) {
              console.log('Section.English_Skills: Error saving contact', err);
            }
            reject(err);
          }
        );
      });
    };
  }
})();
