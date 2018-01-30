/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionItSkills', gzSectionItSkills);

  gzSectionItSkills.$inject = [

  ];

  function gzSectionItSkills() {
    return {
      require: '^^gzSection',
      controller: SectionItSkillsController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/form/directives/sectionItSkills.template.html',
      restrict: 'E',
      scope: {
        page: '=',
        form: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.it_skills;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  SectionItSkillsController.$inject = [
    '$q',
    'contactService',
    'DEBUG'
  ];

  function SectionItSkillsController(
    $q,
    contactService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.it_skills;
    vm.section.requestTime = {};
    vm.section.required = [];
    vm.section.requiredSliders = [
      'IT_Skill_access_to_the_Internet__c',
      'IT_Skills_Ability_to_download_files__c',
      'IT_Skills_Ability_to_view_online_videos__c',
      'IT_Skill_Ability_to_use_Word_documents__c',
      'IT_Skill_Ability_to_use_spreadsheets__c'
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
              console.log('Section.It_Skills: Contact saved');
            }
            resolve(contact);
          },
          function(err) {
            if (DEBUG) {
              console.log('Section.It_Skills: Error saving contact', err);
            }
            reject(err);
          }
        );
      });
    };
  }
})();
