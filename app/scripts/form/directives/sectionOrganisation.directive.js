/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionOrganisation', gzSectionOrganisation);

  gzSectionOrganisation.$inject = [
    'layoutService'
  ];

  function gzSectionOrganisation(layoutService) {
    return {
      require: '^^gzSection',
      controller: SectionOrganisationController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/form/directives/sectionOrganisation.template.html',
      restrict: 'E',
      scope: {
        page: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.organisation;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  SectionOrganisationController.$inject = [
    '$q',
    '$scope',
    '$timeout',
    'accountService',
    'affiliationService',
    'contactService',
    'gaService',
    'layoutService',
    'participantService',
    'DEBUG'
  ];

  function SectionOrganisationController(
    $q,
    $scope,
    $timeout,
    accountService,
    affiliationService,
    contactService,
    gaService,
    layoutService,
    participantService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.organisation;
    vm.section.requestTime = {};
    vm.section.required = [];

    vm.section.preOrgCount = 0;
    vm.section.orgSearchExistingOrgSelected = null;
    vm.section.orgSearchText = null;
    vm.section.orgTypeSelected = 'nhri';
    vm.section.affiliationsFound = {
      nhri: null,
      organisation: null
    };
    vm.section.affiliationsSwitching = {
      nhri: new affiliationService.Affiliation(),
      organisation: new affiliationService.Affiliation()
    };

    vm.page.nhris = [];
    vm.page.organisations = [];
    vm.page.affiliation = null;
    vm.page.affiliations = [];

    // do some things once we know this section is enabled
    $scope.$watch('vm.page.sectionsEnabled', function(value) {
      if (
        vm.page.sectionsEnabled === true &&
        vm.section.enabled !== undefined &&
        vm.section.enabled === true &&
        vm.page.nhris.length === 0
      ) {

        // grab NHRIs, and then non-NHRIs
        retrieveNhris()
        .then(
          function(nhris) {
            vm.page.nhris = nhris;
            if (DEBUG) {
              console.log('found nhris', nhris.length);
            }
            return retrieveNonNhris();
          },
          function(err) {
            vm.section.errorInitial = true;
            if (DEBUG) {
              console.log('There was an error retrieving the NHRIs', err);
            }
          }
        )
        .then(
          function(organisations) {
            vm.page.organisations = organisations;
            if (DEBUG) {
              console.log('found non-nhris', organisations.length);
            }
          },
          function(err) {
            vm.section.errorInitial = true;
            if (DEBUG) {
              console.log(
                'There was an error retrieving other organisations',
                err
              );
            }
          }
        );
      }
    });

    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        // this function recurses 5 times, once a second
        // (well to the parent (section directive) to be precise)
        // when no NHRIs or ORGs currently exist
        if (DEBUG) {
          console.log('Section.Organisation pre');
          console.log('nhris', vm.page.nhris.length);
          console.log('organisations', vm.page.organisations.length);
          console.log('preOrgCount', vm.section.preOrgCount);
        }
        if (
          vm.page.nhris.length > 0 &&
          vm.page.organisations.length > 0
        ) {
          if (vm.page.contact.exists) {
            retrieveAffiliations()
            .then(
              function(affiliations) {
                if (DEBUG) {
                  console.log('found affiliations', affiliations.length);
                }

                // set affiliations
                vm.page.affiliations = affiliations;

                // cycle through affiliations
                var findIfOrganisation = null;
                angular.forEach(
                  vm.page.affiliations,
                  function(affiliation, index) {
                    affiliation.npe5__StartDate__c =
                      new Date(affiliation.npe5__StartDate__c);

                    if (DEBUG) {
                      console.log('processing affiliation', affiliation);
                    }

                    // can we find this org in the non-NHRIs
                    findIfOrganisation =
                      accountService.findAccountInAccounts(
                        {
                          Id: affiliation.npe5__Organization__c
                        },
                        vm.page.organisations
                      );
                    if (findIfOrganisation === null) {
                      affiliation.type = 'nhri';
                    } else {
                      affiliation.type = 'organisation';
                    }

                    if (
                      affiliation.type === 'nhri' &&
                      (
                        vm.section.affiliationsFound.nhri === null ||
                        affiliation.npe5__Primary__c === true
                      )
                    ) {
                      vm.page.affiliation = affiliation;
                      vm.section.affiliationsFound.nhri =
                        affiliationService.saveFoundAffiliation(affiliation);
                      vm.section.affiliationsSwitching.nhri = affiliation;
                      if (DEBUG) {
                        console.log(
                          'NHRI found',
                          vm.section.affiliationsFound.nhri
                        );
                      }
                    } else if (
                      affiliation.type === 'organisation' &&
                      (
                        vm.section.affiliationsFound.organisation === null ||
                        affiliation.npe5__Primary__c === true
                      )
                    ) {
                      vm.section.orgSearchText = findIfOrganisation.Name;
                      vm.section.affiliationsFound.organisation =
                        affiliationService.saveFoundAffiliation(affiliation);
                      vm.section.affiliationsSwitching.organisation =
                        affiliation;
                      if (DEBUG) {
                        console.log(
                          'found an organisation',
                          vm.section.affiliationsFound.organisation
                        );
                      }
                      if (affiliation.npe5__Primary__c === true) {
                        if (DEBUG) {
                          console.log(
                            'it is primary, setting affiliation to org'
                          );
                        }
                        vm.page.affiliation = affiliation;
                        vm.section.orgTypeSelected = 'organisation';
                      }
                  }
                });

                // as the focus above is on NHRI
                // if we made it through and there isn't an affiliation
                // but a non-primary org affiliation was found
                // set affiliation to that
                if (
                  vm.page.affiliation === null &&
                  vm.section.affiliationsFound.organisation
                ) {
                  if (DEBUG) {
                    console.log(
                      'if we are here it means org found, not primary'
                    );
                  }
                  vm.page.affiliation =
                    vm.section.affiliationsFound.organisation;
                  vm.section.orgTypeSelected = 'organisation';
                } else if (vm.page.affiliation === undefined) {
                  if (DEBUG) {
                    console.log(
                      'if we are here it means no affiliations found'
                    );
                  }
                  vm.page.affiliation =
                    new affiliationService.Affiliation();
                }

                resolve(vm.page.affiliation);
              },
              function(err) {
                if (DEBUG) {
                  console.log('We did not find any affiliations');
                }
                if (err.status === 404) {
                  // no affiliations were found, but that's OK
                  if (DEBUG) {
                    console.log('The contact did not have any');
                  }
                  vm.page.affiliation =
                    new affiliationService.Affiliation();
                  resolve(vm.page.affiliation);
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
          } else {
            // there was no contact, create empty affiliation
            vm.page.affiliation = new affiliationService.Affiliation();
            resolve(vm.page.affiliation);
          }
        } else if (vm.section.preOrgCount < 5) {
          // NHRIs and orgs not found yet, recurse for up to 5 seconds
          vm.section.preOrgCount++;
          $timeout(vm.section.sectionCtrl.pre, 1000);
        } else {
          if (DEBUG) {
            console.log('Waited 5 seconds and still timed out');
          }
          gaService.addEvent('Issue', 'Delay', 'Organisation');
          vm.section.preOrgCount = 0;
          vm.section.errorInitial = true;
          reject({
            name: 'Timeout',
            message: 'Waited 5 seconds and still timed out'
          });
        }
      });
    };

    vm.section.process = function() {
      return $q(function(resolve, reject) {
        // if not representing org
        // skip straight through
        if (vm.section.orgTypeSelected === 'individual') {
          resolve(true);
          return;
        }

        vm.section.required = [
          'affiliationRole'
        ];
        // store the original affiliation that was found for comparison later
        vm.page.affiliationFound =
          vm.section.affiliationsFound[vm.section.orgTypeSelected];
        if (vm.section.orgTypeSelected === 'nhri') {
          vm.section.required.push('affiliationOrganisation');
        } else if (vm.section.orgTypeSelected === 'organisation') {
          vm.section.required.push('orgSearchText');
        }

        if (vm.page.action.isTraining === true) {
          vm.section.required.push('affiliationStartDate');
        }

        if (isValid(vm.section.required) === false) {
          vm.section.invalid = true;
          reject({
            name: 'Invalid',
            message: 'Organisation information was found to be invalid'
          });
          return;
        }

        // update some contact fields
        // Set on contact if no affiliation existed before
        // OR if affiliations did exist
        // and the one they're updating is the primary
        if (
          vm.page.affiliationFound === undefined ||
          vm.page.affiliationFound.npe5__Primary__c === true
        ) {
          vm.page.contact.Department = vm.page.affiliation.Department__c;
          vm.page.contact.Title = vm.page.affiliation.npe5__Role__c;
          // this can just happen and finish whenever
          contactService.save(vm.page.contact)
          .then(
            function(contact) {
              if (DEBUG) {
                console.log('Section.Organisation: Contact saved');
              }
            },
            function(err) {
              if (DEBUG) {
                console.log('Section.Organisation: Error saving contact', err);
              }
            }
          );
        }

        // and some affiliation fields
        vm.page.affiliation.npe5__Contact__c = vm.page.contact.Id;

        // check to see if it's a new organisation that requires saving
        // if so save organisation
        // then save affiliation
        isNewOrganisation()
        .then(
          function(organisation) {
            // did we save an organisation
            if (organisation !== null) {
              // we did
              vm.page.affiliation.npe5__Organization__c = organisation.Id;
              vm.page.organisations.push(organisation);
            }

            return saveAffiliation();
          },
          function(err) {
            if (DEBUG) {
              console.log('There was an error saving the new org', err);
            }
            reject(err);
          }
        )
        .then(
          function(affiliation) {
            // did we create or update an affiliation
            if (affiliation !== null) {
              // we did
              vm.page.affiliation = affiliation;
              // set the date on the affiliation to be an object again
              vm.page.affiliation.npe5__StartDate__c =
                new Date(vm.page.affiliation.npe5__StartDate__c);
              // let the form know we now have a found affiliation
              vm.section.affiliationsFound[vm.section.orgTypeSelected] =
                affiliationService.saveFoundAffiliation(vm.page.affiliation);
              if (DEBUG) {
                console.log(
                  'Affiliation saved, putting it to found',
                  vm.section.affiliationsFound[vm.section.orgTypeSelected]
                );
              }
            }

            // add this to the participant
            vm.page.participant.Organisation__c =
              vm.page.affiliation.npe5__Organization__c;
            return participantService.save(vm.page.participant);
          },
          function(err) {
            if (DEBUG) {
              console.log('There was an error saving the affiliation', err);
            }
            reject(err);
          }
        )
        .then(
          function(participant) {
            if (DEBUG) {
              console.log('Added organisation to participant');
            }
            // return the affiliation as that's what this section is all about
            resolve(vm.page.affiliation);
          },
          function(err) {
            if (DEBUG) {
              console.log(
                'There was an error adding org to participant',
                err
              );
            }
            reject(err);
          }
        );
      });
    };

    function retrieveNhris() {
      vm.section.requestTime.retrieveNhris =
        gaService.addSalesforceRequest('List', 'NHRI');
      return accountService.listByType(
        {
          type: 'National Human Rights Institution'
        }
      )
      .$promise
      .then(
        function(data) {
          gaService.addSalesforceResponse(
            'List',
            'NHRI',
            vm.section.requestTime.retrieveNhris
          );
          return data;
        },
        function(err) {
          gaService.addSalesforceError(
            'List',
            'NHRI',
            vm.section.requestTime.retrieveNhris,
            err.status
          );
          return err;
        }
      );
    }

    function retrieveNonNhris() {
      vm.section.requestTime.retrieveNonNhris =
        gaService.addSalesforceRequest('List', 'Non NHRI');
      return accountService.listByOtherTypes(
        {
          type: 'National Human Rights Institution'
        }
      )
      .$promise
      .then(
        function(data) {
          gaService.addSalesforceResponse(
            'List',
            'Non NHRI',
            vm.section.requestTime.retrieveNonNhris
          );
          return data;
        },
        function(err) {
          gaService.addSalesforceError(
            'List',
            'Non NHRI',
            vm.section.requestTime.retrieveNonNhris,
            err.status
          );
          return err;
        }
      );
    }

    function retrieveAffiliations() {
      gaService.addSalesforceRequest('List', 'Affiliation');
      return affiliationService.listByContact(
        {
          contactid: vm.page.contact.Id
        }
      )
      .$promise
      .then(
        function(data) {
          gaService.addSalesforceResponse(
            'List',
            'Affiliation'
          );
          return data;
        },
        function(err) {
          gaService.addSalesforceError(
            'List',
            'Affiliation',
            err.status
          );
          return err;
        }
      );
    }

    vm.selectOrganisation = function(organisation) {
      if (
        organisation === undefined ||
        vm.section.orgTypeSelected === 'nhri'
      ) {
        return;
      }
      vm.page.affiliation.npe5__Organization__c = organisation.Id;
      if (DEBUG) {
        console.log(vm.page.affiliation);
        console.log(
          'org selected',
          vm.page.affiliation.npe5__Organization__c
        );
      }
    };

    vm.filterOrganisations = function(query) {
      if (DEBUG) {
        console.log('filterOrganisations', query);
      }
      var results = query ?
        vm.page.organisations.filter(createFilterFor(query)) :
        vm.page.organisations;
      return results;
    }

    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(organisation) {
        var lowercaseName = angular.lowercase(organisation.Name);

        return (lowercaseName.indexOf(lowercaseQuery) === 0);
      };
    }

    vm.changeOrganisationType = function() {
      if (DEBUG) {
        console.log('changeOrganisationType', vm.section.orgTypeSelected);
      }
      if (vm.section.orgTypeSelected === 'organisation') {
        vm.section.affiliationsSwitching.nhri = vm.page.affiliation;
        vm.page.affiliation =
          vm.section.affiliationsSwitching.organisation;
      } else if (vm.section.orgTypeSelected === 'nhri') {
        vm.section.affiliationsSwitching.organisation =
          vm.page.affiliation;
        vm.page.affiliation = vm.section.affiliationsSwitching.nhri;
      } else {
        vm.page.affiliation = {};
        if (DEBUG) {
          console.log('affiliation emptied');
        }
      }
    };

    function isNewOrganisation(organisation) {
      if (DEBUG) {
        console.log('isNewOrganisation', organisation);
        console.log('searchText', vm.section.orgSearchText);
        console.log(
          'existingOrgSelected',
          vm.section.orgSearchExistingOrgSelected);
      }
      return $q(function(resolve, reject) {
        // determine if this is requires a new org or not
        // if org.name empty, or we found a match we don't need a new org
        if (
          !vm.section.orgSearchText ||
          vm.section.orgSearchExistingOrgSelected
        ) {
          if (DEBUG) {
            console.log('Either no new org name entered, or match found');
          }
          resolve(null);
        } else {
          accountService.save(organisation)
          .then(
            function(organisation) {
              resolve(organisation);
            },
            function(err) {
              reject(err);
            }
          );
        }
      });
    }

    function saveAffiliation() {
      if (DEBUG) {
        console.log('saveAffiliation', vm.page.affiliation);
        console.log('saveAffiliation-original', vm.page.affiliationFound);
      }
      return $q(function(resolve, reject) {
        if (!vm.page.affiliationFound) {
          if (DEBUG) {
            console.log('New affiliation');
          }
          vm.page.affiliation.npe5__Primary__c = true;
          vm.page.affiliation.npe5__Status__c = 'Current';
        } else if (affiliationService.equalsOrganisation(
          vm.page.affiliation,
          vm.page.affiliationFound
        ) === false) {
          if (DEBUG) {
            console.log('Org has changed');
          }
          // they have changed organisations
          // create new affiliation for them
          vm.page.affiliation.Id = null;
          vm.page.affiliation.npe5__Primary__c = true;
          vm.page.affiliation.npe5__Status__c = 'Current';
        } else if (affiliationService.equalsOther(
          vm.page.affiliation,
          vm.page.affiliationFound
        ) === false) {
          if (DEBUG) {
            console.log('Other info has changed');
          }
          // other info has changed
          // update the current affiliation as is
        } else {
          if (DEBUG) {
            console.log('Affiliation unchanged, do not save');
          }
          resolve(null);
        }
        affiliationService.save(vm.page.affiliation)
        .then(
          function(affiliation) {
            resolve(affiliation);
          },
          function(err) {
            reject(err);
          }
        );
      });
    }
  }
})();
