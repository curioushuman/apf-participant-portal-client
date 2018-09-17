/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint quotes: 0 */
/* eslint camelcase: 0 */
/* eslint no-undef: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.contacts')
    .controller('ContactsController', ContactsController);

  ContactsController.$inject = [
    '$q',
    '$filter',
    '$mdDateLocale',
    '$scope',
    'gaService',
    'layoutService',
    'DEBUG',
    'API_URI'
  ];

  function ContactsController(
    $q,
    $filter,
    $mdDateLocale,
    $scope,
    gaService,
    layoutService,
    DEBUG,
    API_URI
  ) {
    var vm = this;

    // debugging / developing
    if (DEBUG) {
      console.log('DEBUG is ON');
      console.log('API URI', API_URI);
    }

    vm.navigate = layoutService.navigate;
    vm.refresh = layoutService.refresh;

    // at some point make this better
    // if (!DEBUG) {
    //   window.onbeforeunload = function(e) {
    //     return 'Are you sure you want to navigate away from this page?';
    //   };
    // }

    vm.page = {
      email: null,
      working: false,
      requests: {},
      currentSection: '',
      sections: {
        email: {
          id: 'email',
          title: 'Email',
          next: 'organisation',
          enabled: true,
          ready: false,
          first: true
        },
        organisation: {
          id: 'organisation',
          title: 'Organisation contact information',
          next: 'chairperson',
          enabled: true,
          ready: false
        },
        chairperson: {
          id: 'chairperson',
          title: 'Chairperson contact information',
          next: false,
          enabled: true,
          ready: false
        }
      },
      sectionsEnabled: false,
      sectionsEnabledCount: 0,
      sectionsReadyCount: 0
    };

    vm.page.sectionReady = function(sectionId) {
      vm.page.sections[sectionId].ready = true;
      vm.page.sectionsReadyCount++;
      if (vm.page.sectionsEnabledCount === 0) {
        angular.forEach(
          vm.page.sections,
          function(section, index) {
            if (section.enabled === true) {
              vm.page.sectionsEnabledCount++;
            }
          }
        );
      }
      if (vm.page.sectionsReadyCount === vm.page.sectionsEnabledCount) {
        vm.page.sectionsEnabled = true;
        vm.page.formStatus = 'open';
      }
    };

    // make space for the contact who is completing the form
    vm.page.contact = {};

    // enable the sections
    // vm.page.sectionsEnabled = true;
    // this now happens in the email section

    // this could do with some minor attention
    // if participant save fails you should show an error
    vm.page.complete = function() {
      vm.page.working = false;
      if (DEBUG) {
        console.log('Completing form');
      }

      vm.page.currentSection = false;
      vm.page.formStatus = 'complete';
      layoutService.navigate(null, 'top');
    };

    vm.page.save = function() {
      vm.page.working = false;
      vm.page.resumeSection = vm.page.currentSection;
      vm.page.currentSection = false;
      vm.page.formStatus = 'saved';
      layoutService.navigate(null, 'top');
    };

    vm.page.resume = function() {
      vm.page.working = false;
      vm.page.currentSection = vm.page.sections[vm.page.resumeSection].next;
      vm.page.formStatus = 'open';
      layoutService.navigate(null, 'top');
    };

    // date stuff
    $mdDateLocale.formatDate = function(date) {
      return $filter('date')(date, 'dd/MM/yyyy');
    };
  }
})();
