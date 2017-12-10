/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionPersonal', gzSectionPersonal);

  gzSectionPersonal.$inject = [
    'layoutService'
  ];

  function gzSectionPersonal(layoutService) {
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
        action: '=',
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
    '$scope',
    'gaService',
    'layoutService',
    'DEBUG'
  ];

  function SectionPersonalController(
    $q,
    $scope,
    gaService,
    layoutService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.personal;
    vm.sectionNext = vm.page.sections[vm.section.next];

    vm.section.required = [
      'contactFirstName', 'contactLastName',
      'contactSalutation', 'contactGender'
    ];

    vm.page.salutations =
      ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.', 'Atty.', 'Hon. Just.'];
    vm.page.genders =
      ['Male', 'Female', 'Another term', 'Prefer not to disclose'];

    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        vm.page.working = false;
        resolve(true);
      });
    };

    vm.section.process = function() {
      vm.page.working = true;


    };

  }
})();