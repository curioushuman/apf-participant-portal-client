/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionContact', gzSectionContact);

  gzSectionContact.$inject = [

  ];

  function gzSectionContact() {
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
    'contactService',
    'DEBUG'
  ];

  function SectionContactController(
    $q,
    contactService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.contact;
    vm.section.requestTime = {};
    vm.section.required = [];

    vm.section.emailIsWork = 'yes';
    vm.section.phoneTypes = ['Work', 'Mobile', 'Home', 'Other'];
    vm.section.phoneNumber = '';

    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        switch (vm.page.contact.npe01__PreferredPhone__c) {
          case 'Mobile':
            vm.section.phoneNumber = vm.page.contact.MobilePhone;
            break;
          case 'Home':
            vm.section.phoneNumber = vm.page.contact.HomePhone;
            break;
          case 'Work':
          default:
            vm.section.phoneNumber = vm.page.contact.npe01__WorkPhone__c;
            break;
        }

        if (vm.page.contact.HasOptedOutOfEmail === undefined) {
          vm.page.contact.HasOptedOutOfEmail = true;
        }

        resolve(true);
      });
    };

    vm.section.process = function() {
      return $q(function(resolve, reject) {
        vm.section.required = [
          'contactPhone',
          'contactPreferredPhone'
        ];

        if (vm.page.action.isTraining === true) {
          vm.section.required.push('contactClosestAirport');
        }

        if (isValid(vm.section.required) === false) {
          vm.section.invalid = true;
          reject({
            name: 'Invalid',
            message: 'Contact information was found to be invalid'
          });
          return;
        }

        if (vm.page.contact.HasOptedOutOfEmail === '1') {
          vm.page.contact.HasOptedOutOfEmail = true;
        } else {
          vm.page.contact.HasOptedOutOfEmail = false;
        }

        if (vm.section.emailIsWork === 'yes') {
          vm.page.contact.npe01__Preferred_Email__c = 'Work';
        } else {
          vm.page.contact.npe01__Preferred_Email__c = 'Home';
          vm.page.contact.npe01__HomeEmail__c = vm.email;
        }

        switch (vm.page.contact.npe01__PreferredPhone__c) {
          case 'Mobile':
            vm.page.contact.MobilePhone = vm.section.phoneNumber;
            break;
          case 'Home':
            vm.page.contact.HomePhone = vm.section.phoneNumber;
            break;
          case 'Work':
          default:
            vm.page.contact.npe01__WorkPhone__c = vm.section.phoneNumber;
            break;
        }

        contactService.save(vm.page.contact)
        .then(
          function(contact) {
            if (DEBUG) {
              console.log('Section.Organisation: Contact saved');
            }
            resolve(contact);
          },
          function(err) {
            if (DEBUG) {
              console.log('Section.Organisation: Error saving contact', err);
            }
            reject(err);
          }
        );
      });
    };

    vm.changeEmailWork = function() {
      if (vm.section.emailIsWork === 'no') {
        vm.page.contact.npe01__WorkEmail__c = vm.page.email;
      } else {
        vm.page.contact.npe01__WorkEmail__c = '';
      }
    };
  }
})();
