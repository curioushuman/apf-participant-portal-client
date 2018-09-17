/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionPersonal', gzSectionPersonal);

  gzSectionPersonal.$inject = [

  ];

  function gzSectionPersonal() {
    return {
      require: '^^gzSection',
      controller: SectionPersonalController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/form/directives/sectionPersonal.template.html',
      restrict: 'E',
      scope: {
        page: '=',
        form: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.personal;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  SectionPersonalController.$inject = [
    '$q',
    'contactService',
    'formService',
    'DEBUG'
  ];

  function SectionPersonalController(
    $q,
    contactService,
    formService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.personal;

    vm.section.required = [
      'contactFirstName', 'contactLastName',
      'contactSalutation', 'contactGender'
    ];

    vm.page.salutations = formService.salutations();
    vm.page.genders = formService.genders();

    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        resolve(true);
      });
    };

    vm.section.process = function() {
      return $q(function(resolve, reject) {
        if (DEBUG) {
          console.log('Section.Personal saving contact', vm.page.contact);
        }
        contactService.save(vm.page.contact)
        .then(
          function(contact) {
            resolve(vm.page.contact);
          },
          function(err) {
            reject(err);
          }
        );
      });
    };
  }
})();
