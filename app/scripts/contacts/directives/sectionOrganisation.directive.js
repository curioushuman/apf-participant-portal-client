/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* eslint no-negated-condition: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.contacts')
    .directive('gzContactsSectionOrganisation', gzContactsSectionOrganisation);

  gzContactsSectionOrganisation.$inject = [

  ];

  function gzContactsSectionOrganisation() {
    return {
      require: '^^gzSection',
      controller: ContactsSectionOrganisationController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/contacts/directives/sectionOrganisation.template.html',
      restrict: 'E',
      scope: {
        page: '=',
        form: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.organisation;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  ContactsSectionOrganisationController.$inject = [
    '$q',
    '$scope',
    '$timeout',
    'accountService',
    'affiliationService',
    'gaService',
    'DEBUG'
  ];

  function ContactsSectionOrganisationController(
    $q,
    $scope,
    $timeout,
    accountService,
    affiliationService,
    gaService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.organisation;
    vm.section.required = [];

    // this either needs to go into the last section loaded
    // or I find a better way in the controller itself
    // the latter would be better (if time)
    vm.page.sectionsEnabled = true;
    vm.page.formStatus = 'open';

    vm.page.affiliation = null;
    vm.page.affiliations = [];
    vm.page.organisationIds = [];
    vm.page.organisations = [];
    vm.page.organisation = null;

    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        if (DEBUG) {
          console.log('Section.Organisation pre');
        }

        if (
          vm.page.contact.exists &&
          vm.page.affiliations.length === 0
        ) {
          vm.section.errorInitial = false;

          retrieveAffiliations()
          .then(
            function(affiliations) {
              if (DEBUG) {
                console.log('found affiliations', affiliations.length);
              }

              // set affiliations
              vm.page.affiliations = affiliations;

              // gather org IDs
              angular.forEach(
                vm.page.affiliations,
                function(affiliation, index) {
                  if (DEBUG) {
                    console.log('processing affiliation', affiliation);
                  }

                  // gather the organisation ID
                  vm.page.organisationIds.push(
                    affiliation.npe5__Organization__c
                  );
                }
              );

              // obtain organisations
              retrieveOrganisations()
              .then(
                function(organisations) {
                  if (DEBUG) {
                    console.log('found organisations', organisations.length);
                  }

                  // set organisations
                  vm.page.organisations = organisations;

                  // find the NHRI
                  angular.forEach(
                    vm.page.organisations,
                    function(organisation, index) {
                      if (DEBUG) {
                        console.log('processing organisation', organisation);
                      }

                      if (
                        organisation.Type ===
                        'National Human Rights Institution'
                      ) {
                        vm.page.organisation = organisation;
                      }
                    }
                  );

                  // check we found an NHRI
                  if (vm.page.organisation === null) {
                    vm.page.formStatus = 'unauthorised';
                    reject(vm.page.formStatus);
                  } else {
                    resolve(vm.page.organisation);
                  }
                },
                function(err) {
                  // something actually went wrong
                  if (DEBUG) {
                    console.log('Something went wrong', err);
                  }
                  vm.section.errorInitial = true;
                  reject(err);
                }
              );
            },
            function(err) {
              if (err.status === 404) {
                // no affiliations were found, but that's OK
                if (DEBUG) {
                  console.log('The contact did not have any affiliations');
                }
                vm.page.formStatus = 'unauthorised';
                reject(vm.page.formStatus);
              } else {
                // something actually went wrong
                if (DEBUG) {
                  console.log('Something went wrong', err);
                }
                vm.section.errorInitial = true;
                reject(err);
              }
            }
          );
        }
      });
    };

    vm.section.process = function() {
      return $q(function(resolve, reject) {
        resolve(true);
      });
    };

    function retrieveAffiliations() {
      gaService.addSalesforceRequest('List Affiliation', vm.page.contact.Email);
      return affiliationService.listByContact(
        {
          contactid: vm.page.contact.Id
        }
      )
      .$promise
      .then(
        function(data) {
          gaService.addSalesforceResponse(
            'List Affiliation',
            vm.page.contact.Email
          );
          return data;
        },
        function(err) {
          gaService.addSalesforceError(
            'List Affiliation',
            vm.page.contact.Email,
            err.status
          );
          return err;
        }
      );
    }

    function retrieveOrganisations() {
      if (DEBUG) {
        console.log('Organisation IDs', vm.page.organisationIds);
      }

      // This is a HACK that needs to be fixed
      // The retrieveMultiple function doesn't work
      // You'll need to fix that
      // when you have, switch off the HACK

      gaService.addSalesforceRequest(
        'List Organisations by ID',
        'Contacts form'
      );
      // HACK
      // return accountService.retrieveMultiple(
      //   {
      //     accountids: vm.page.organisationIds
      //   }
      // )
      var hack_organisationId = '0016F00001wxetJQAQ';
      return accountService.retrieve(
        {
          accountid: hack_organisationId
        }
      )
      .$promise
      .then(
        function(data) {
          gaService.addSalesforceResponse(
            'List Organisations by ID',
            'Contacts form'
          );
          // more HACK
          // return data;
          return [data];
        },
        function(err) {
          gaService.addSalesforceError(
            'List Organisations by ID',
            'Contacts form',
            err.status
          );
          return err;
        }
      );
    }
  }
})();
