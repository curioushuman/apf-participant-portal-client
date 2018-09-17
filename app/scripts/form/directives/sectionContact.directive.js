/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
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
        page: '=',
        form: '='
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
    'contactService',
    'countryService',
    'formService',
    'DEBUG'
  ];

  function SectionContactController(
    $q,
    $scope,
    contactService,
    countryService,
    formService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.contact;
    vm.section.requestTime = {};
    vm.section.required = [];

    vm.section.emailIsWork = 'yes';
    vm.section.phoneTypes = formService.phoneTypes();
    vm.section.phoneNumber = '';

    vm.page.countries = [];

    // do some things once we know this section is enabled
    $scope.$watch('vm.page.sectionsEnabled', function(value) {
      if (
        vm.page.sectionsEnabled === true &&
        vm.section.enabled !== undefined &&
        vm.section.enabled === true &&
        vm.page.countries.length === 0
      ) {
        // grab countries
        countryService.listAll()
        .then(
          function(countries) {
            if (DEBUG) {
              console.log('Yay countries', countries[0]);
            }
            vm.page.countries = countries;
          },
          function(err) {
            if (DEBUG) {
              console.log('Error listing countries', err);
            }
            vm.section.errorInitial = true;
          }
        );
      }
    });

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

        vm.page.contact.AddEmailToMailingList = false;
        if (
          vm.page.contact.HasOptedOutOfEmail !== undefined &&
          vm.page.contact.HasOptedOutOfEmail === false
        ) {
          vm.page.contact.AddEmailToMailingList = true;
        }

        if (DEBUG) {
          console.log('Pre contact', vm.page.contact);
        }

        resolve(true);
      });
    };

    vm.section.process = function() {
      return $q(function(resolve, reject) {
        vm.section.required = [
          'contactPhone',
          'contactPreferredPhone',
          'contactCountry'
        ];

        if (vm.page.action.isTraining === true) {
          vm.section.required.push('contactClosestAirport');
        }

        if (vm.section.sectionCtrl.isValid(vm.section.required) === false) {
          vm.section.invalid = true;
          reject({
            name: 'Invalid',
            message: 'Contact information was found to be invalid'
          });
          return;
        }

        // reset the validation to empty
        // so we don't get stuck at the valid function above in section
        vm.section.required = [];

        if (DEBUG) {
          console.log('Contact info submitted', vm.page.contact);
          console.log('vm.section.emailIsWork', vm.section.emailIsWork);
        }

        if (vm.page.contact.AddEmailToMailingList) {
          vm.page.contact.HasOptedOutOfEmail = false;
        } else {
          vm.page.contact.HasOptedOutOfEmail = true;
        }

        if (vm.section.emailIsWork === 'yes') {
          vm.page.contact.npe01__Preferred_Email__c = 'Work';
          vm.page.contact.npe01__WorkEmail__c = vm.email;
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
