/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* eslint no-negated-condition: 0 */
/* global angular */

// NOTE: there is a hack in this page that needs to remain in place
// until we've fnished testing everything else
// This hack is in place for 2 reasons
// 1. to allow us to test using a test organisation in Salesforce
// 2. Because the retrieveMultiple function on the account service is broken
// So, initially, leave the HACK in place (marked with HACK)
// Then once we've tested everything else we'll fix the function
// and remove the HACK
// NOTE: to fixe the function you might need to edit both the account service
// and the related account controller in the apf-participantportal code

// OTHER NOTE: for some reason clicking on the
// completeSection (see form/directives) for this section does not work
// it is supposed to re-open that section.
// Please look into this as well.

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
    vm.section.required = [
      'organisationEmail',
      'organisationPhone',
      'organisationShippingStreet',
      'organisationShippingCity',
      'organisationShippingState',
      'organisationShippingPostalCode',
      'organisationWebsite'
    ];
    vm.page.sectionReady('organisation');

    vm.page.organisationIds = [];
    vm.page.organisation = null;

    // in our Pre(load) function we will
    // Grab the affiliations from the contact
    // and find the organisation we will be updating
    // NOTE: an affiliation is when a contact is affiliated with an organisation
    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        if (DEBUG) {
          console.log('Section.Organisation pre');
        }

        if (
          vm.page.contact.exists &&
          vm.page.contact.affiliations === undefined
        ) {
          vm.section.errorInitial = false;

          retrieveContactAffiliations()
          .then(
            function(affiliations) {
              if (DEBUG) {
                console.log('found affiliations', affiliations.length);
              }

              // record affiliations against contact
              vm.page.contact.affiliations = affiliations;

              // gather org IDs from the contacts affiliations
              angular.forEach(
                vm.page.contact.affiliations,
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

              // obtain organisations this contact is affiliated with
              retrieveOrganisations()
              .then(
                function(organisations) {
                  if (DEBUG) {
                    console.log('found organisations', organisations.length);
                  }

                  // record organisations against contact
                  vm.page.contact.organisations = organisations;

                  // in this form we only want to update contact information
                  // for an organisation of type
                  // "National Human Rights Institution" (NHRI)
                  // so, find the NHRI record
                  angular.forEach(
                    vm.page.contact.organisations,
                    function(organisation, index) {
                      if (DEBUG) {
                        console.log('processing organisation', organisation);
                      }

                      // HACK
                      // if (
                      //   organisation.Type ===
                      //   'National Human Rights Institution'
                      // ) {
                      //   vm.page.organisation = organisation;
                      // }
                      vm.page.organisation = organisation;
                      // end HACK
                    }
                  );

                  // check we found an NHRI
                  // if we didn't, then this person is not authorised
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
                // no affiliations found
                if (DEBUG) {
                  console.log('The contact did not have any affiliations');
                }
                // therefore this person is not authorised
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

    // in our process function we need to
    // save the organisation email
    vm.section.process = function() {
      return $q(function(resolve, reject) {
        if (DEBUG) {
          console.log(
            'Section.Organisation saving organisation',
            vm.page.contact
          );
        }
        accountService.save(vm.page.organisation)
        .then(
          function(contact) {
            resolve(vm.page.organisation);
          },
          function(err) {
            reject(err);
          }
        );
      });
    };

    function retrieveContactAffiliations() {
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

      gaService.addSalesforceRequest(
        'List Organisations by ID',
        'Contacts form'
      );
      // HACK
      var hack_organisationId = '0016F00001qccTfQAI';
      // return accountService.retrieveMultiple(
      //   {
      //     accountids: vm.page.organisationIds
      //   }
      // )
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
