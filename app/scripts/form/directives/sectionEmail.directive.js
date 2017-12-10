/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionEmail', gzSectionEmail);

  gzSectionEmail.$inject = [
    'layoutService'
  ];

  function gzSectionEmail(layoutService) {
    return {
      require: '^^gzSection',
      controller: SectionEmailController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/form/directives/sectionEmail.template.html',
      restrict: 'E',
      scope: {
        page: '=',
        action: '=',
        form: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.email;
      }
    };
  }

  SectionEmailController.$inject = [
    '$scope',
    'gaService',
    'layoutService',
    'DEBUG'
  ];

  function SectionEmailController(
    $scope,
    gaService,
    layoutService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.email;
    vm.sectionNext = vm.page.sections[vm.section.next];

    if (DEBUG) {
      vm.email = 'mike@curioushuman.com.au';
    }

    vm.page.sections.email.process = function() {
      vm.page.working = true;

      gaService.setUserId(vm.email);
      gaService.addSalesforceRequest('Retrieve', 'Contact');
      contactService.retrieve(
        {
          email: vm.email
        },
        function(contact) {
          gaService.addSalesforceResponse(
            'Retrieve',
            'Contact'
          );
          vm.page.contact = contact;
          vm.page.contact.exists = true;
          if (vm.debug) {
            console.log('Contact found');
          }
        },
        function(err) {
          if (err.status === 404) {
            // carry on through, we just didn't find a record
            // create a new Contact object
            vm.page.contact = new contactService.Contact(
              {
                email: vm.email
              }
            );
            vm.page.contact.exists = false;
            vm.section.complete = true;
            vm.sectionNext.pre();
          } else {
            if (vm.debug) {
              console.log('There was an error retrieving the contact');
              console.log(err);
            }
            vm.section.error = true;
            gaService.addSalesforceError(
              'Retrieve',
              'Contact',
              err.status
            );
          }
        }
      );
    };

  }
})();
