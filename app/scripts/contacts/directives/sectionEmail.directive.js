/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.contacts')
    .directive('gzContactsSectionEmail', gzContactsSectionEmail);

  gzContactsSectionEmail.$inject = [

  ];

  function gzContactsSectionEmail() {
    return {
      require: '^^gzSection',
      controller: ContactsSectionEmailController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/contacts/directives/sectionEmail.template.html',
      restrict: 'E',
      scope: {
        page: '=',
        form: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        console.log('Fark');
        sectionCtrl.section = sectionCtrl.page.sections.email;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  ContactsSectionEmailController.$inject = [
    '$q',
    'contactService',
    'gaService',
    'DEBUG'
  ];

  function ContactsSectionEmailController(
    $q,
    contactService,
    gaService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.email;
    vm.section.required = [
      'contactEmail'
    ];

    if (DEBUG) {
      vm.page.email = 'mike@curioushuman.com.au';
    }

    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        resolve(true);
      });
    };

    vm.section.process = function() {
      gaService.setUserId(vm.page.email);
      gaService.addSalesforceRequest('Retrieve Contact', vm.page.email);
      return $q(function(resolve, reject) {
        contactService.retrieve(
          {
            email: vm.page.email
          },
          function(contact) {
            gaService.addSalesforceResponse(
              'Retrieve Contact',
              vm.page.email
            );
            vm.page.contact = contact;
            vm.page.contact.exists = true;
            if (DEBUG) {
              console.log('Contact found', vm.page.contact);
            }
            resolve(vm.page.contact);
          },
          function(err) {
            if (err.status === 404) {
              // if we don't have the in the database we'll not allow them
              // to edit the contact information
              vm.page.formStatus = 'unauthorised';
            } else {
              gaService.addSalesforceError(
                'Retrieve Contact',
                vm.page.email,
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
