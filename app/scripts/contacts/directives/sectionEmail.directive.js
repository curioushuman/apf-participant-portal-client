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
    vm.page.sectionReady('email');

    if (DEBUG) {
      vm.page.email = 'mike@curioushuman.com.au';
    }

    // for this section we do nothing in our pre(load) function
    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        resolve(true);
      });
    };

    // in our process function we need to
    // find the contact based on the email provided
    // if we can't find them they're not authorised, instructions are provided
    vm.section.process = function() {
      gaService.addSalesforceRequest('Retrieve Contact', vm.page.email);
      return $q(function(resolve, reject) {
        // HACK: the below has been turned off while people review the form
        vm.page.contact.exists = true;
        resolve(vm.page.contact);
        // contactService.retrieve(
        //   {
        //     email: vm.page.email
        //   },
        //   function(contact) {
        //     gaService.addSalesforceResponse(
        //       'Retrieve Contact',
        //       vm.page.email
        //     );
        //     vm.page.contact = contact;
        //     vm.page.contact.exists = true;
        //     if (DEBUG) {
        //       console.log('Contact found', vm.page.contact);
        //     }
        //     gaService.setUserId(vm.page.email);
        //     resolve(vm.page.contact);
        //   },
        //   function(err) {
        //     if (err.status === 404) {
        //       // if we don't have the in the database we'll not allow them
        //       // to edit the contact information
        //       // this person is not authorised
        //       vm.page.formStatus = 'unauthorised';
        //     } else {
        //       gaService.addSalesforceError(
        //         'Retrieve Contact',
        //         vm.page.email,
        //         err.status
        //       );
        //       reject(err);
        //     }
        //   }
        // );
      });
    };
  }
})();
