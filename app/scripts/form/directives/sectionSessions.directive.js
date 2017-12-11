/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionContact', gzSectionContact);

  gzSectionContact.$inject = [
    'layoutService'
  ];

  function gzSectionContact(layoutService) {
    return {
      require: '^^gzSection',
      controller: SectionContactController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/form/directives/sectionContact.template.html',
      restrict: 'E',
      scope: {
        page: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.contact;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  SectionContactController.$inject = [
    '$q',
    '$scope',
    '$timeout',
    'accountService',
    'affiliationService',
    'contactService',
    'gaService',
    'layoutService',
    'participantService',
    'DEBUG'
  ];

  function SectionContactController(
    $q,
    $scope,
    $timeout,
    accountService,
    affiliationService,
    contactService,
    gaService,
    layoutService,
    participantService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.contact;
    vm.section.requestTime = {};
    vm.section.required = [];

    // do some things once we know this section is enabled
    $scope.$watch('vm.page.sectionsEnabled', function(value) {

    });

    vm.section.pre = function() {
      return $q(function(resolve, reject) {

      });
    };

    vm.section.process = function() {
      return $q(function(resolve, reject) {

      });
    };
  }
})();
