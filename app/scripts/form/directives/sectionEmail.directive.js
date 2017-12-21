/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionEmail', gzSectionEmail);

  gzSectionEmail.$inject = [

  ];

  function gzSectionEmail() {
    return {
      require: '^^gzSection',
      controller: SectionEmailController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/form/directives/sectionEmail.template.html',
      restrict: 'E',
      scope: {
        page: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.email;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  SectionEmailController.$inject = [
    '$q',
    'contactService',
    'gaService',
    'DEBUG'
  ];

  function SectionEmailController(
    $q,
    contactService,
    gaService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.email;

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
      gaService.addSalesforceRequest('Retrieve', 'Contact');
      return $q(function(resolve, reject) {
        contactService.retrieve(
          {
            email: vm.page.email
          },
          function(contact) {
            gaService.addSalesforceResponse(
              'Retrieve',
              'Contact'
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
              // this is ok, we just didn't find a record
              // create a new Contact object
              vm.page.contact = new contactService.Contact(
                {
                  email: vm.page.email
                }
              );
              vm.page.contact.exists = false;
              resolve(vm.page.contact);
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
