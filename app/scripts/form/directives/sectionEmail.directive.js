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
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  SectionEmailController.$inject = [
    '$q',
    '$scope',
    'contactService',
    'gaService',
    'layoutService',
    'DEBUG'
  ];

  function SectionEmailController(
    $q,
    $scope,
    contactService,
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

    vm.section.process = function() {
      vm.page.working = true;
      gaService.setUserId(vm.email);
      gaService.addSalesforceRequest('Retrieve', 'Contact');
      return $q(function(resolve, reject) {
        contactService.retrieve(
          {
            email: vm.email
          },
          function(contact) {
            gaService.addSalesforceResponse(
              'Retrieve',
              'Contact'
            );
            if (DEBUG) {
              console.log('Contact found');
            }
            vm.page.contact = contact;
            vm.page.contact.exists = true;
            resolve(contact);
          },
          function(err) {
            if (err.status === 404) {
              // this is ok, we just didn't find a record
              // create a new Contact object
              vm.page.contact = new contactService.Contact(
                {
                  email: vm.email
                }
              );
              vm.page.contact.exists = false;
              resolve(contact);
            } else {
              gaService.addSalesforceError(
                'Retrieve',
                'Contact',
                err.status
              );
              reject(err);
            }
          }
        );
      });
    };
  }
})();
