/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint quotes: 0 */
/* eslint camelcase: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.registration')
    .controller('RegistrationController', RegistrationController);

  RegistrationController.$inject = [
    '$routeParams',
    '$scope',
    '$q',
    '$location',
    '$filter',
    '$timeout',
    '$mdDateLocale',
    'layoutService',
    'actionService',
    'contactService',
    'accountService',
    'affiliationService',
    'gaService',
    'participantService',
    'questionService',
    'responseService',
    'sessionService',
    'detectionService',
    'sessionParticipationService',
    'DEBUG',
    'API_URI'
  ];

  function RegistrationController(
    $routeParams,
    $scope,
    $q,
    $location,
    $filter,
    $timeout,
    $mdDateLocale,
    layoutService,
    actionService,
    contactService,
    accountService,
    affiliationService,
    gaService,
    participantService,
    questionService,
    responseService,
    sessionService,
    detectionService,
    sessionParticipationService,
    DEBUG,
    API_URI
  ) {
    var vm = this;

    // debugging / developing
    vm.debug = DEBUG;
    vm.openAll = false;
    if (vm.debug === true) {
      console.log('DEBUG is ON');
      console.log('API URI', API_URI);
    }

    vm.navigate = layoutService.navigate;

    vm.working = false;
    vm.formStatus = 'open';
    vm.completeForm = completeForm;

    vm.actionLoaded = false;
    vm.actionError = false;
    vm.actionIsTraining = false;
    vm.actionErrorMessage = {};

    // date stuff
    $mdDateLocale.formatDate = function(date) {
      return $filter('date')(date, 'dd/MM/yyyy');
    };

    // find the action based on the slug
    vm.action = actionService.retrieve(
      {
        slug: $routeParams.actionSlug
      },
      function() {
        vm.actionLoaded = true;

        if (vm.debug === true) {
          console.log(vm.action);
        }

        // work out the correct start and end dates
        if (
          vm.action.Start_date__c !== null
        ) {
          vm.action.startDate =
            layoutService.formatDate(vm.action.Start_date__c);
        }
        if (
          vm.action.Finish_date__c !== null &&
          vm.action.Finish_date__c !== vm.action.Start_date__c
        ) {
          vm.action.finishDate =
            layoutService.formatDate(vm.action.Finish_date__c);
        }

        // see if there is a due date
        if (vm.action.Registrations_due_date__c) {
          // format accordingly
          vm.action.registrationDate =
            layoutService.formatDate(vm.action.Registrations_due_date__c);
          // determine if it has passed
          var registrationDate = new Date(vm.action.Registrations_due_date__c);
          var nowDate = new Date();
          if (nowDate.getTime() > registrationDate.getTime()) {
            vm.formStatus = 'closed';
          }
        } else {
          vm.formStatus = 'closed';
        }

        // sort out the selection criteria
        if (vm.action.Selection_criteria__c) {
          vm.action.selectionCriteria =
            layoutService.listFromString(vm.action.Selection_criteria__c);
        }

        if (vm.action.Ideal_candidate__c) {
          vm.action.idealCandidate =
            layoutService.listFromString(vm.action.Ideal_candidate__c);
        }

        // is training an action?
        if (vm.action.RecordTypeId === '0126F000000iyY7QAI') {
          vm.actionIsTraining = true;
        }

        // grab the training partner of the action
        // Needs review aftre we've changed how training partners work in SF
        // console.log('Obtain training partner');
        // console.log(vm.action.Training_partner__c);
        // vm.action.trainingPartnerAccount = accountService.retrieve(
        //   { accountid: vm.action.Training_partner__c },
        //   function() {
        //     console.log('Found the training partner');
        //     console.log(vm.action.trainingPartnerAccount);
        //   },
        //   function(err) {
        //     console.log('Training partner could not be found');
        //   }
        // );
      },
      function(err) {
        if (vm.debug) {
          console.log(err);
        }
        if (err.status === 404) {
          vm.actionErrorMessage = {
            title: 'No action found',
            message: 'Please check URL'
          };
        } else {
          vm.actionErrorMessage = {
            title: 'Error at server',
            message: 'Please reload the page'
          };
        }
        vm.actionError = true;
      }
    );

    // initiate participant to grab the tech stuff
    vm.participant = new participantService.Participant();

    // And responses / session participations
    var participantResponses = null;
    var participantSessionsParticipations = null;

    // Tech and connection detection
    // the connection results will be known when the file downloads
    // these results will be saved when the Participant is saved
    // and this is done several times over the course of the form
    // otherwise the default low speed will be retained
    vm.participant.Connection_speed_Mbps__c = 0.1;
    var processConnectionResults = function() {
      if (vm.debug) {
        console.log('Connection results', detectionService.connectionResults);
      }
      vm.participant.Connection_speed_Mbps__c =
        detectionService.connectionResults.speedMbps;
    };
    $timeout(function() {
      detectionService.detectConnection(processConnectionResults);
    }, 3000);

    // platform results
    var processPlatformResults = function() {
      if (vm.debug) {
        console.log('Platform results', detectionService.platformResults);
      }
      vm.participant.Technology_browser__c =
        detectionService.platformResults.browser;
      vm.participant.Technology_operating_system__c =
        detectionService.platformResults.os;
      vm.participant.Technology_screen_resolution__c =
        detectionService.platformResults.resolution;
    };
    $timeout(function() {
      detectionService.detectPlatform(processPlatformResults);
    }, 1000);

    // country
    // Note: this doesn't work yet
    // detectionService.detectGeo(
    //   function(data) {
    //     if (vm.debug) {
    //       console.log('Geo', data);
    //     }
    //   },
    //   function(err) {
    //     if (vm.debug) {
    //       console.log('Error detecting Geo', err);
    //     }
    //   }
    // );
    // detectionService.detectGeo()
    //   .success(function(data) {
    //     if (vm.debug) {
    //       console.log('Geo data', data);
    //     }
    //   });

    // only save the detection results once we have a contact Id
    // currently this is called when contact is found
    // or new contact is first saved
    var saveDetectionResults = function() {
      // we put these here again just in case they have finished prior to
      // the participant.retrieve check which resets to an empty participant
      processConnectionResults();
      processPlatformResults();

      // now save the participant with the tech. info
      processSaveParticipant()
      .then(
        function(participant) {
          if (vm.debug) {
            console.log(
              'Participant detection results saved',
              participant
            );
          }
        },
        function(err) {
          if (vm.debug) {
            console.log(
              'There was an error saving the participant detection results',
              err
            );
          }
        }
      );
    };

    vm.sectionActive = 'email';

    vm.editSection = function(section, source) {
      vm.sectionActive = section;
      // layoutService.navigate(null, section);
      layoutService.navigate(null, 'top');

      // adding event
      if (source === undefined) {
        gaService.addEvent('Navigation', 'Section, next', section);
      } else {
        gaService.addEvent('Navigation', 'Section, ' + source, section);
      }
    };

    // Email section
    if (vm.debug) {
      vm.email = 'mike@curioushuman.com.au';
    }
    vm.contactExists = false;
    vm.emailSectionError = false;
    vm.emailSectionStatus = 'disabled';
    vm.emailSectionTitle = 'Email';
    vm.processEmail = processEmail;
    vm.emailSectionNextDisabled = function() {
      if (vm.working) {
        return true;
      }
      if (vm.email === '') {
        return true;
      }
      if ($scope.pageForm.contactEmail.$invalid) {
        return true;
      }
      return false;
    };

    // process email
    function processEmail() {
      vm.working = true;

      gaService.setUserId(vm.email);

      gaService.addSalesforceRequest('Retrieve', 'Contact');
      vm.contact = contactService.retrieve(
        {
          email: vm.email
        },
        function(contact) {
          gaService.addSalesforceResponse(
            'Retrieve',
            'Contact'
          );
          vm.contactExists = true;
          if (vm.debug) {
            console.log('Contact found');
            console.log('Looking for Participant');
          }

          // See if there is a participant record for this contact
          gaService.addSalesforceRequest('Retrieve', 'Participant');
          vm.participant = participantService.retrieve(
            {
              contactid: vm.contact.Id,
              actionid: vm.action.Id
            },
            function(participant) {
              gaService.addSalesforceResponse(
                'Retrieve',
                'Participant'
              );
              if (vm.debug) {
                console.log('Participant found', participant);
              }

              // save detection results
              // this will update the participant we found
              saveDetectionResults();

              // also grab the responses for the participant
              if (vm.debug) {
                console.log('Looking for responses / session participations');
              }
              if (vm.actionIsTraining) {
                gaService.addSalesforceRequest('List', 'Response');
                vm.participant.responses = responseService.list(
                  {
                    participantid: vm.participant.Id
                  },
                  function(responses) {
                    gaService.addSalesforceResponse(
                      'List',
                      'Response'
                    );
                    if (vm.debug) {
                      console.log('Found responses', responses);
                    }
                    participantResponses = responses;
                    preQueryPostResponses();
                    return responses;
                  },
                  function(err) {
                    gaService.addSalesforceError(
                      'List',
                      'Response',
                      err.status
                    );
                    if (vm.debug) {
                      console.log('Error looking for responses', err);
                    }
                    return err;
                  }
                );
              } else {
                gaService.addSalesforceRequest(
                  'List',
                  'SessionParticipation'
                );
                vm.participant.sessionParticipations =
                  sessionParticipationService.list(
                    {
                      participantid: vm.participant.Id
                    },
                    function(sessionParticipations) {
                      gaService.addSalesforceResponse(
                        'List',
                        'SessionParticipation'
                      );
                      if (vm.debug) {
                        console.log(
                          'Found sessionParticipations',
                          sessionParticipations
                        );
                      }
                      // FIX THE participantSessionsParticipations
                      participantSessionsParticipations = sessionParticipations;
                      preQueryPostResponses();
                      return sessionParticipations;
                    },
                    function(err) {
                      gaService.addSalesforceError(
                        'List',
                        'Response',
                        err.status
                      );
                      if (vm.debug) {
                        console.log(
                          'Error looking for sessionParticipations',
                          err
                        );
                      }
                      return err;
                    }
                  );
              }
            },
            function(err) {
              if (err.status === 404) {
                // we don't care if it is a 404
                // it means this person has not registered for this action

                // setup empty responses and sessionParticipations
                if (vm.actionIsTraining) {
                  vm.participant.responses = [];
                } else {
                  vm.participant.sessionParticipations = [];
                }
                preQueryPostResponses();

                // save detection results
                // this will create a new participant
                saveDetectionResults();
              } else {
                gaService.addSalesforceError(
                  'Retrieve',
                  'Participant',
                  err.status
                );
                if (vm.debug) {
                  console.log(
                    'There was a non-404 error retrieving the participant'
                  );
                  console.log(err);
                }
              }
            }
          );

          vm.emailSectionStatus = 'complete';
          vm.prePersonal();
        },
        function(err) {
          if (vm.debug) {
            console.log('There was an error retrieving the contact');
            console.log(err);
          }

          if (err.status === 404) {
            // carry on through, we just didn't find a record
            // create a new Contact object
            vm.contact = new contactService.Contact(
              {
                email: vm.email
              }
            );

            preQueryPostResponses();

            vm.emailSectionStatus = 'complete';
            vm.prePersonal();
          } else {
            vm.emailSectionError = true;
            gaService.addSalesforceError(
              'Retrieve',
              'Contact',
              err.status
            );
          }
        }
      );
    }

    function preQueryPostResponses() {
      // start obtaining the questions / sessions
      // THIS NEEDS TO MOVE DOWN BELOW TO AFTER OBTAIN RESPONSES
      if (vm.actionIsTraining) {
        gaService.addSalesforceRequest('List', 'Question');
        preQueryQuestions()
        .then(
          function() {
            gaService.addSalesforceResponse(
              'List',
              'Question'
            );
            if (vm.debug) {
              console.log('Hooray we already have questions');
            }
          },
          function(err) {
            gaService.addSalesforceError(
              'List',
              'Question',
              err.status
            );
            if (vm.debug) {
              console.log('Error preExperience', err);
            }
            vm.experienceSectionErrorTop = true;
          }
        );
      } else {
        gaService.addSalesforceRequest('List', 'Session');
        preQuerySessions()
        .then(
          function() {
            gaService.addSalesforceResponse(
              'List',
              'Session'
            );
            console.log('Hooray we already have sessions');
          },
          function(err) {
            gaService.addSalesforceError(
              'List',
              'Session',
              err.status
            );
            if (vm.debug) {
              console.log('Error preSessions', err);
            }
            vm.sessionsSectionErrorTop = true;
          }
        );
      }
    }

    // Personal section
    vm.personalSectionStatus = 'disabled';
    vm.personalSectionInvalid = false;
    vm.personalSectionError = false;
    vm.personalSectionTitle = 'Personal information';
    vm.prePersonal = prePersonal;
    vm.processPersonal = processPersonal;
    vm.salutations =
      ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.', 'Atty.', 'Hon. Just.'];
    vm.genders = ['Male', 'Female', 'Another term', 'Prefer not to disclose'];
    vm.personalRequired = [
      'contactFirstName', 'contactLastName',
      'contactSalutation', 'contactGender'
    ];
    vm.personalSectionNextDisabled = function() {
      if (vm.working) {
        return true;
      }
      return false;
    };

    // pre
    function prePersonal() {
      vm.working = false;
      vm.editSection('personal');
    }

    // process
    function processPersonal() {
      if (isValid(vm.personalRequired) === false) {
        vm.personalSectionInvalid = true;
        return;
      }

      vm.working = true;

      // save the contact in here
      if (vm.contact.Id === undefined) {
        gaService.addSalesforceRequest('Create', 'Contact');
        vm.contact.$save(
          function(record) {
            gaService.addSalesforceResponse(
              'Create',
              'Contact'
            );
            if (record.success) {
              vm.personalSectionStatus = 'complete';

              // save detection results
              saveDetectionResults();

              // move on to org ONLY once contact has been saved
              vm.preOrganisation();
            } else {
              vm.personalSectionError = true;
              if (vm.debug) {
                console.log('There was an error creating the contact');
              }
            }
          },
          function(err) {
            gaService.addSalesforceError(
              'Create',
              'Contact',
              err.status
            );
            if (vm.debug) {
              console.log('There was an error creating the contact', err);
            }
          }
        );
      } else {
        gaService.addSalesforceRequest('Update', 'Contact');
        vm.contact.$update(
          {
            contactid: vm.contact.Id
          },
          function(record) {
            gaService.addSalesforceResponse(
              'Update',
              'Contact'
            );
            if (record.success) {
              vm.personalSectionStatus = 'complete';
            } else {
              vm.personalSectionError = true;
              if (vm.debug) {
                console.log('There was an error updating the contact');
              }
            }
          },
          function(err) {
            gaService.addSalesforceError(
              'Update',
              'Contact',
              err.status
            );
          }
        );

        // don't wait for contact to be updated
        vm.preOrganisation();
      }
    }

    // Organisation section
    vm.nhris = [];
    vm.organisations = [];
    vm.organisationMatch = null;
    vm.organisationName = null;
    vm.organisationFound = null;
    vm.filterOrganisations = filterOrganisations;
    vm.selectOrganisation = selectOrganisation;
    vm.affiliations = [];
    vm.affiliationsFound = {
      nhri: null,
      organisation: null
    };
    vm.affiliationsSwitching = {
      nhri: new affiliationService.Affiliation(),
      organisation: new affiliationService.Affiliation()
    };
    vm.organisationType = 'nhri';
    vm.organisationSectionStatus = 'disabled';
    vm.organisationSectionInvalid = false;
    vm.organisationSectionError = false;
    vm.organisationSectionErrorTop = false;
    vm.organisationSectionTitle = 'Organisation';
    vm.preOrganisation = preOrganisation;
    vm.processOrganisation = processOrganisation;
    vm.organisationRequired = [];
    vm.organisationSectionNextDisabled = function() {
      if (vm.working || vm.organisationSectionErrorTop) {
        return true;
      }
      return false;
    };

    // pre organisation
    var preOrgCount = 0;
    function preOrganisation(source) {
      vm.working = true;
      if (vm.debug) {
        console.log('preOrganisation');
        console.log(vm.nhris.length);
        console.log(vm.organisations.length);
        console.log('preOrgCount', preOrgCount);
      }
      if (typeof source === 'string') {
        gaService.addEvent('Navigation', 'Section, ' + source, 'organisation');
      }
      if (
        vm.nhris.length > 0 &&
        vm.organisations.length > 0
      ) {
        if (vm.contactExists) {
          gaService.addSalesforceRequest('List', 'Affiliation');
          preRetrieveAffiliations()
          .then(
            function(affiliations) {
              gaService.addSalesforceResponse(
                'List',
                'Affiliation'
              );
              if (vm.debug) {
                console.log('found affiliations', affiliations.length);
              }
              vm.working = false;
              vm.editSection('organisation');
            },
            function(err) {
              if (err.status === 404) {
                vm.affiliation = new affiliationService.Affiliation();
              } else {
                gaService.addSalesforceError(
                  'List',
                  'Affiliation',
                  err.status
                );
                vm.organisationSectionErrorTop = true;
              }
              vm.working = false;
              vm.editSection('organisation');
            }
          );
        } else {
          vm.affiliation = new affiliationService.Affiliation();
          vm.working = false;
          vm.editSection('organisation');
        }
      } else if (preOrgCount < 5) {
        preOrgCount++;
        $timeout(preOrganisation, 1000);
      } else {
        gaService.addEvent('Issue', 'Delay', 'Organisation');
        preOrgCount = 0;
        vm.organisationSectionErrorTop = true;
        vm.working = false;
        vm.editSection('organisation');
      }
    }

    // start grabbing the organisations while they're filling out the form
    var rootRequestTimes = {};
    rootRequestTimes.ListNhris =
      gaService.addSalesforceRequest('List', 'NHRI');
    preQueryNhris()
    .then(
      function(nhris) {
        gaService.addSalesforceResponse(
          'List',
          'NHRI',
          rootRequestTimes.ListNhris
        );
        if (vm.debug) {
          console.log('found nhris', nhris.length);
        }
        rootRequestTimes.ListNonNhris =
          gaService.addSalesforceRequest('List', 'Non NHRI');
        return preQueryNonNhris();
      },
      function(err) {
        gaService.addSalesforceError(
          'List',
          'NHRI',
          rootRequestTimes.ListNhris,
          err.status
        );
        vm.organisationSectionErrorTop = true;
        if (vm.debug) {
          console.log('There was an error retrieving the NHRIs', err);
        }
      }
    )
    .then(
      function(organisations) {
        gaService.addSalesforceResponse(
          'List',
          'Non NHRI',
          rootRequestTimes.ListNonNhris
        );
        if (vm.debug) {
          console.log('found non-nhris', organisations.length);
        }
      },
      function(err) {
        gaService.addSalesforceError(
          'List',
          'Non NHRI',
          rootRequestTimes.ListNonNhris,
          err.status
        );
        vm.organisationSectionErrorTop = true;
        if (vm.debug) {
          console.log(
            'There was an error retrieving other organisations',
            err
          );
        }
      }
    );

    function preQueryNhris() {
      if (vm.nhris.length) {
        return $q(function(resolve, reject) {
          resolve(vm.nhris);
        });
      }
      return accountService.listByType(
        {
          type: 'National Human Rights Institution'
        }
      )
      .$promise
      .then(
        function(data) {
          vm.nhris = data;
          return vm.nhris;
        },
        function(err) {
          return err;
        }
      );
    }

    function preQueryNonNhris() {
      if (vm.organisations.length) {
        return $q(function(resolve, reject) {
          resolve(vm.organisations);
        });
      }
      return accountService.listByOtherTypes(
        {
          type: 'National Human Rights Institution'
        }
      )
      .$promise
      .then(
        function(data) {
          vm.organisations = data;
          return vm.organisations;
        },
        function(err) {
          return err;
        }
      );
    }

    function preRetrieveAffiliations() {
      return $q(function(resolve, reject) {
        vm.affiliations = affiliationService.listByContact(
          {
            contactid: vm.contact.Id
          },
          function() {
            if (vm.debug) {
              console.log('found affiliations', vm.affiliations);
            }
            // cycle through affiliations
            var organisation = null;
            angular.forEach(vm.affiliations, function(affiliation, index) {
              affiliation.npe5__StartDate__c =
                new Date(affiliation.npe5__StartDate__c);

              organisation = {
                Id: affiliation.npe5__Organization__c
              };
              organisation =
                accountService.findAccountInAccounts(
                  organisation,
                  vm.organisations
                );
              if (organisation === null) {
                affiliation.type = 'nhri';
              } else {
                affiliation.type = 'organisation';
              }

              if (vm.debug) {
                console.log('processing affiliation', affiliation);
              }
              if (
                affiliation.type === 'nhri' &&
                (
                  vm.affiliationsFound.nhri === null ||
                  affiliation.npe5__Primary__c === true
                )
              ) {
                vm.affiliation = affiliation;
                vm.affiliationsFound.nhri =
                  affiliationService.saveFoundAffiliation(affiliation);
                vm.affiliationsSwitching.nhri = affiliation;
                if (vm.debug) {
                  console.log('NHRI found', vm.affiliationsFound.nhri);
                }
              } else if (
                affiliation.type === 'organisation' &&
                (
                  vm.affiliationsFound.organisation === null ||
                  affiliation.npe5__Primary__c === true
                )
              ) {
                vm.organisationName = organisation.Name;
                vm.organisationFound = organisation;
                vm.affiliationsFound.organisation =
                  affiliationService.saveFoundAffiliation(affiliation);
                vm.affiliationsSwitching.organisation = affiliation;
                if (vm.debug) {
                  console.log(
                    'found an organisation',
                    vm.affiliationsFound.organisation
                  );
                }
                if (affiliation.npe5__Primary__c === true) {
                  if (vm.debug) {
                    console.log('it is primary, setting affiliation to org');
                  }
                  vm.affiliation = affiliation;
                  vm.organisationType = 'organisation';
                }
              }
            });

            // as the focus above is on NHRI
            // if we made it through and there isn't an affiliation
            // but a non-primary org affiliation was found
            // set affiliation to that
            if (
              vm.affiliation === undefined &&
              vm.affiliationsFound.organisation
            ) {
              if (vm.debug) {
                console.log('if we are here it means org found, not primary');
              }
              vm.affiliation = vm.affiliationsFound.organisation;
              vm.organisationType = 'organisation';
            } else if (vm.affiliation === undefined) {
              if (vm.debug) {
                console.log('if we are here it means no affiliations found');
              }
              vm.affiliation = new affiliationService.Affiliation();
            }

            // and return
            resolve(vm.affiliations);
          },
          function(err) {
            reject(err);
          }
        );
      });
    }

    function selectOrganisation(organisation) {
      if (
        organisation === undefined ||
        vm.organisationType === 'nhri'
      ) {
        return;
      }
      console.log(vm.affiliation);
      vm.affiliation.npe5__Organization__c = organisation.Id;
      if (vm.debug) {
        console.log('org selected', vm.affiliation.npe5__Organization__c);
      }
    }

    function filterOrganisations(query) {
      if (vm.debug) {
        console.log('filterOrganisations', query);
      }
      var results = query ?
        vm.organisations.filter(createFilterFor(query)) :
        vm.organisations;
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
      if (vm.debug) {
        console.log('changeOrganisationType', vm.organisationType);
      }
      if (vm.organisationType === 'organisation') {
        vm.affiliationsSwitching.nhri = vm.affiliation;
        vm.affiliation = vm.affiliationsSwitching.organisation;
      } else if (vm.organisationType === 'nhri') {
        vm.affiliationsSwitching.organisation = vm.affiliation;
        vm.affiliation = vm.affiliationsSwitching.nhri;
      } else {
        vm.affiliation = {};
        if (vm.debug) {
          console.log('affiliation emptied');
        }
      }
    };

    // process
    function processOrganisation() {
      // if not representing org
      // skip straight through
      if (vm.organisationType === 'individual') {
        vm.organisationSectionStatus = 'complete';
        vm.preContact();
        return;
      }

      vm.organisationRequired = [
        'affiliationRole'
      ];
      vm.affiliationFound = vm.affiliationsFound[vm.organisationType];
      if (vm.organisationType === 'nhri') {
        vm.organisationRequired.push('affiliationOrganisation');
      } else if (vm.organisationType === 'organisation') {
        vm.organisationRequired.push('organisationName');
      }

      if (vm.actionIsTraining === true) {
        vm.organisationRequired.push('affiliationStartDate');
      }

      if (isValid(vm.organisationRequired) === false) {
        vm.organisationSectionInvalid = true;
        return;
      }

      vm.working = true;

      // update some contact fields
      // Set on contact if no affiliation existed before
      // OR if affiliations did exist
      // and the one they're updating is the primary
      if (
        !vm.affiliationFound ||
        vm.affiliationFound.npe5__Primary__c === true
      ) {
        vm.contact.Department = vm.affiliation.Department__c;
        vm.contact.Title = vm.affiliation.npe5__Role__c;
        // this can just happen and finish whenever
        processSaveContact()
        .then(
          function(contact) {
            if (vm.debug) {
              console.log('processOrganisation: Contact saved');
            }
          },
          function(err) {
            if (vm.debug) {
              console.log('processOrganisation: error saving contact', err);
            }
            // ideally this will be rectified in subsequent sections
          }
        );
      }

      // and some affiliation fields
      vm.affiliation.npe5__Contact__c = vm.contact.Id;

      // organisation stuff
      // we check whether or not it is a new one in processSaveOrganisation
      var organisation = new accountService.Account();
      organisation.Name = vm.organisationName;

      processSaveOrganisation(organisation)
      .then(
        function(organisation) {
          if (organisation !== null) {
            vm.affiliation.npe5__Organization__c = organisation.Id;
            vm.organisations.push(organisation);
          }

          return processSaveAffiliation();
        },
        function(err) {
          if (vm.debug) {
            console.log('There was an error saving the new org', err);
          }
          vm.organisationSectionError = true;
          vm.working = false;
        }
      )
      .then(
        function(affiliation) {
          if (affiliation !== null) {
            // set the date on the affiliation to be an object again
            vm.affiliation.npe5__StartDate__c =
              new Date(vm.affiliation.npe5__StartDate__c);
            // let the form know we now have a found affiliation
            vm.affiliationsFound[vm.organisationType] =
              affiliationService.saveFoundAffiliation(vm.affiliation);
            if (vm.debug) {
              console.log(
                'Affiliation saved, putting it to found',
                vm.affiliationsFound[vm.organisationType]
              );
            }
          }

          // add this to the participant
          vm.participant.Organisation__c = vm.affiliation.npe5__Organization__c;
          // save in it's own time
          processSaveParticipant()
          .then(
            function(participant) {
              if (vm.debug) {
                console.log('Added organisation to participant');
              }
            },
            function(err) {
              if (vm.debug) {
                console.log(
                  'There was an error adding org to participant',
                  err
                );
              }
            }
          );

          vm.organisationSectionStatus = 'complete';
          vm.preContact();
        },
        function(err) {
          if (vm.debug) {
            console.log('There was an error saving the affiliation', err);
          }
          vm.organisationSectionError = true;
          vm.working = false;
        }
      );
    }

    function processSaveOrganisation(organisation) {
      if (vm.debug) {
        console.log('processSaveOrganisation', organisation);
        console.log('processSaveOrganisation-name', vm.organisationName);
        console.log('processSaveOrganisation-match', vm.organisationMatch);
      }
      return $q(function(resolve, reject) {
        // determine if this is requires a new org or not
        // if org.name empty, or we found a match
        if (
          !vm.organisationName ||
          vm.organisationMatch
        ) {
          if (vm.debug) {
            console.log('Either no new org name entered, or match found');
          }
          resolve(null);
        } else {
          gaService.addSalesforceRequest('Create', 'Organisation');
          organisation.$save(
            function(record) {
              gaService.addSalesforceResponse(
                'Create',
                'Organisation'
              );
              if (record.success) {
                resolve(organisation);
              } else {
                if (vm.debug) {
                  console.log('There was an error creating the organisation');
                }
                reject('There was an error creating the organisation');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create',
                'Organisation',
                err.status
              );
              if (vm.debug) {
                console.log(
                  'There was an error creating the organisation',
                  err
                );
              }
              reject(err);
            }
          );
        }
      });
    }

    function processSaveAffiliation() {
      if (vm.debug) {
        console.log('processSaveAffiliation', vm.affiliation);
        console.log('processSaveAffiliation-original', vm.affiliationFound);
      }
      return $q(function(resolve, reject) {
        if (!vm.affiliationFound) {
          if (vm.debug) {
            console.log('New affiliation');
          }
          vm.affiliation.npe5__Primary__c = true;
          vm.affiliation.npe5__Status__c = 'Current';
          gaService.addSalesforceRequest('Create', 'Affiliation');
          vm.affiliation.$save(
            function(record) {
              gaService.addSalesforceResponse(
                'Create',
                'Affiliation'
              );
              if (record.success) {
                resolve(vm.affiliation);
              } else {
                if (vm.debug) {
                  console.log('There was an error creating the affiliation');
                }
                reject('An error occurred creating the affiliation');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create',
                'Affiliation',
                err.status
              );
              if (vm.debug) {
                console.log('There was an error creating the affiliation', err);
              }
              reject(err);
            }
          );
        } else if (affiliationService.equalsOrganisation(
          vm.affiliation,
          vm.affiliationFound
        ) === false) {
          if (vm.debug) {
            console.log('Org has changed');
          }
          // they have changed organisations
          // create new affiliation for them
          vm.affiliation.Id = null;
          vm.affiliation.npe5__Primary__c = true;
          vm.affiliation.npe5__Status__c = 'Current';
          gaService.addSalesforceRequest('Create', 'Affiliation');
          vm.affiliation.$save(
            function(record) {
              gaService.addSalesforceResponse(
                'Create',
                'Affiliation'
              );
              if (record.success) {
                resolve(vm.affiliation);
              } else {
                if (vm.debug) {
                  console.log(
                    'There was an error creating the NEW affiliation'
                  );
                }
                reject('An error occurred creating the NEW affiliation');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create',
                'Affiliation',
                err.status
              );
              if (vm.debug) {
                console.log(
                  'There was an error creating the NEW affiliation',
                  err
                );
              }
              reject(err);
            }
          );
        } else if (affiliationService.equalsOther(
          vm.affiliation,
          vm.affiliationFound
        ) === false) {
          if (vm.debug) {
            console.log('Other info has changed');
          }
          // other info has changed
          // update the current affiliation
          gaService.addSalesforceRequest('Update', 'Affiliation');
          vm.affiliation.$update(
            {
              affiliationid: vm.affiliation.Id
            },
            function(record) {
              gaService.addSalesforceResponse(
                'Update',
                'Affiliation'
              );
              if (record.success) {
                resolve(record);
              } else {
                if (vm.debug) {
                  console.log(
                    'There was an error updating the affiliation'
                  );
                }
                reject('An error occurred updating the affiliation');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Update',
                'Affiliation',
                err.status
              );
              if (vm.debug) {
                console.log(
                  'There was an error updating the affiliation',
                  err
                );
              }
              reject(err);
            }
          );
        } else {
          if (vm.debug) {
            console.log('Affiliation unchanged, do not save');
          }
          resolve(null);
        }
      });
    }

    // Contact section
    vm.emailIsWork = 'yes';
    vm.phoneTypes = ['Work', 'Mobile', 'Home', 'Other'];
    vm.contactSectionStatus = 'disabled';
    vm.contactSectionInvalid = false;
    vm.contactSectionError = false;
    vm.contactSectionTitle = 'Contact details';
    vm.preContact = preContact;
    vm.processContact = processContact;
    vm.contactRequired = [
      'contactPhone',
      'contactPreferredPhone'
    ];
    vm.contactSectionNextDisabled = function() {
      if (vm.working) {
        return true;
      }
      return false;
    };

    // pre
    function preContact() {
      switch (vm.contact.npe01__PreferredPhone__c) {
        case 'Mobile':
          vm.Phone = vm.contact.MobilePhone;
          break;
        case 'Home':
          vm.Phone = vm.contact.HomePhone;
          break;
        case 'Work':
        default:
          vm.Phone = vm.contact.npe01__WorkPhone__c;
          break;
      }

      if (vm.contact.HasOptedOutOfEmail === undefined) {
        vm.contact.HasOptedOutOfEmail = true;
      }

      vm.working = false;
      vm.editSection('contact');
    }

    // process
    function processContact() {
      if (vm.actionIsTraining) {
        vm.contactRequired.push('contactClosestAirport');
      }
      if (isValid(vm.contactRequired) === false) {
        vm.contactSectionInvalid = true;
        return;
      }

      vm.working = true;

      if (vm.contact.HasOptedOutOfEmail === '1') {
        vm.contact.HasOptedOutOfEmail = true;
      } else {
        vm.contact.HasOptedOutOfEmail = false;
      }

      if (vm.emailIsWork === 'yes') {
        vm.contact.npe01__Preferred_Email__c = 'Work';
      } else {
        vm.contact.npe01__Preferred_Email__c = 'Home';
        vm.contact.npe01__HomeEmail__c = vm.email;
      }

      switch (vm.contact.npe01__PreferredPhone__c) {
        case 'Mobile':
          vm.contact.MobilePhone = vm.Phone;
          break;
        case 'Home':
          vm.contact.HomePhone = vm.Phone;
          break;
        case 'Work':
        default:
          vm.contact.npe01__WorkPhone__c = vm.Phone;
          break;
      }

      processSaveContact()
      .then(
        function() {
          vm.contactSectionStatus = 'complete';
          if (vm.actionIsTraining) {
            vm.preExperience();
          } else {
            vm.preSessions();
          }
        },
        function(err) {
          if (vm.debug) {
            console.log('Error processingContact', err);
          }
          vm.contactSectionError = true;
          vm.working = false;
        }
      );
    }

    vm.changeEmailWork = function() {
      if (vm.emailIsWork === 'no') {
        vm.contact.npe01__WorkEmail__c = vm.email;
      } else {
        vm.contact.npe01__WorkEmail__c = '';
      }
    };

    // Experience section
    vm.questions = [];
    vm.experienceSectionStatus = 'disabled';
    vm.experienceSectionInvalid = false;
    vm.experienceSectionError = false;
    vm.experienceErrors = {};
    vm.experienceSectionErrorTop = false;
    vm.experienceSectionTitle = 'Experience';
    vm.preExperience = preExperience;
    vm.processExperience = processExperience;
    vm.processExperienceProcessing = {
      processes: 1,
      processing: 1
    };
    vm.experienceRequired = [
      'participantPriorExperienceTopic'
    ];
    vm.experienceSectionNextDisabled = function() {
      if (vm.working) {
        return true;
      }
      return false;
    };

    // pre
    function preExperience() {
      vm.working = false;
      vm.editSection('experience');
    }

    function preQueryQuestions() {
      return questionService.list(
        {
          actionid: vm.action.Id
        }
      )
      .$promise
      .then(
        function(data) {
          vm.questions = data;
          if (vm.debug) {
            console.log('Questions', vm.questions);
          }
          angular.forEach(vm.questions, function(question, index) {
            // do we have a response
            // need to FIX this
            // vm.participant.responses
            // instead of
            // participantResponses
            // for some reason it is being overriden
            var participant_responses = $filter('filter')(
              participantResponses,
              {
                Self_assessment_question__c: question.Id
              }
            );
            if (vm.debug) {
              console.log('found responses', participant_responses);
            }
            if (
              participant_responses !== null &&
              participant_responses.length > 0
            ) {
              question.response = participant_responses[0];
            } else {
              question.response = new responseService.Response();
            }
            vm.processExperienceProcessing.processes++;
          });
          return vm.questions;
        },
        function(err) {
          return err;
        }
      );
    }

    // process
    function processExperience() {
      vm.experienceSectionInvalid = false;

      if (isValid(vm.experienceRequired) === false) {
        vm.experienceSectionInvalid = true;
      }

      // special validation for experience
      angular.forEach(vm.questions, function(question, index) {
        if (
          question.response.Score__c === undefined ||
          (
            question.response.Score__c === 0 &&
            question.response.NoScore === undefined
          )
        ) {
          question.response.error = true;
          vm.experienceSectionInvalid = true;
        }
      });

      if (vm.experienceSectionInvalid === true) {
        return;
      }

      vm.working = true;

      // reset processing count
      vm.processExperienceProcessing.processing = 1;

      // chaining the promises as responses rely on participant Id
      processSaveParticipant()
      .then(
        function(participant) {
          // q.all works as it doesn't matter the order of processing
          var promises = processSaveResponses();
          $q.all(promises).then(
            function(data) {
              if (vm.debug) {
                console.log('All promises have resolved', data);
              }

              vm.experienceSectionStatus = 'complete';
              vm.preItSkills();
            },
            function(err) {
              if (vm.debug) {
                console.log('Something went wrong', err);
              }
              vm.experienceSectionError = true;
              vm.working = false;
            }
          );
        },
        function(err) {
          vm.experienceSectionError = true;
          vm.working = false;
          if (vm.debug) {
            console.log('There was an error saving the participant', err);
          }
        }
      );
    }

    function processSaveResponses() {
      var promises = [];
      angular.forEach(vm.questions, function(question, index) {
        question.response.Participant__c = vm.participant.Id;
        question.response.Self_assessment_question__c = question.Id;
        promises.push(processSaveResponse(question.response));
      });

      return promises;
    }

    // IT skills section
    vm.itSkillsSectionStatus = 'disabled';
    vm.itSkillsSectionInvalid = false;
    vm.itSkillsSectionError = false;
    vm.itSkillsErrors = {};
    vm.itSkillsSectionErrorTop = false;
    vm.itSkillsSectionTitle = 'IT skills';
    vm.preItSkills = preItSkills;
    vm.processItSkills = processItSkills;
    // vm.itSkillsRequired = [];
    vm.itSkillsRequiredSliders = [
      'IT_Skill_access_to_the_Internet__c',
      'IT_Skills_Ability_to_download_files__c',
      'IT_Skills_Ability_to_view_online_videos__c',
      'IT_Skill_Ability_to_use_Word_documents__c',
      'IT_Skill_Ability_to_use_spreadsheets__c'
    ];
    vm.itSkillsSectionNextDisabled = function() {
      if (vm.working) {
        return true;
      }
      return false;
    };

    // pre
    function preItSkills() {
      vm.working = false;
      vm.editSection('itSkills');
    }

    // process
    function processItSkills() {
      vm.itSkillsSectionInvalid = false;

      // NOT required
      // if (isValid(vm.itSkillsRequired) === false) {
      //   vm.itSkillsSectionInvalid = true;
      // }

      // special validation for itSkills
      angular.forEach(vm.itSkillsRequiredSliders, function(slider, index) {
        if (
          vm.contact[slider] === undefined ||
          vm.contact[slider] === null ||
          vm.contact[slider] === 0
        ) {
          vm.itSkillsErrors[slider] = true;
          vm.itSkillsSectionInvalid = true;
        } else {
          vm.itSkillsErrors[slider] = false;
        }
      });

      if (vm.itSkillsSectionInvalid === true) {
        return;
      }

      vm.working = true;

      processSaveContact()
      .then(
        function() {
          vm.itSkillsSectionStatus = 'complete';
          vm.preEnglishSkills();
        },
        function(err) {
          if (vm.debug) {
            console.log('Error processingItSkills', err);
          }
          vm.itSkillsSectionError = true;
          vm.working = false;
        }
      );
    }

    // English skills section
    vm.englishSkillsSectionStatus = 'disabled';
    vm.englishSkillsSectionInvalid = false;
    vm.englishSkillsSectionError = false;
    vm.englishSkillsErrors = {};
    vm.englishSkillsSectionErrorTop = false;
    vm.englishSkillsSectionTitle = 'English skills';
    vm.preEnglishSkills = preEnglishSkills;
    vm.processEnglishSkills = processEnglishSkills;
    // vm.englishSkillsRequired = [];
    vm.englishSkillsRequiredSliders = [
      'EN_Skills_Ability_to_read_in_English__c',
      'EN_Skills_Ability_to_write_in_English__c',
      'EN_Skills_Ability_to_understand_spoken__c',
      'EN_Skills_Ability_to_speak_English__c'
    ];
    vm.englishSkillsSectionNextDisabled = function() {
      if (vm.working) {
        return true;
      }
      return false;
    };

    // pre
    function preEnglishSkills() {
      vm.working = false;
      vm.editSection('englishSkills');
    }

    // process
    function processEnglishSkills() {
      vm.englishSkillsSectionInvalid = false;

      // NOT required
      // if (isValid(vm.englishSkillsRequired) === false) {
      //   vm.englishSkillsSectionInvalid = true;
      // }

      // special validation for englishSkills
      angular.forEach(vm.englishSkillsRequiredSliders, function(slider, index) {
        if (
          vm.contact[slider] === undefined ||
          vm.contact[slider] === null ||
          vm.contact[slider] === 0
        ) {
          vm.englishSkillsErrors[slider] = true;
          vm.englishSkillsSectionInvalid = true;
        } else {
          vm.englishSkillsErrors[slider] = false;
        }
      });

      if (vm.englishSkillsSectionInvalid === true) {
        return;
      }

      vm.working = true;

      processSaveContact()
      .then(
        function() {
          vm.englishSkillsSectionStatus = 'complete';
          vm.preExpectations();
        },
        function(err) {
          if (vm.debug) {
            console.log('Error processingEnglishSkills', err);
          }
          vm.englishSkillsSectionError = true;
          vm.working = false;
        }
      );
    }

    function isValidSlider(slider) {
      if (
        vm.contact[slider] === null ||
        vm.contact[slider] === 0
      ) {
        if (slider.indexOf('EN') === 0) {
          vm.englishSkillsErrors[slider] = true;
        } else {
          vm.itSkillsErrors[slider] = true;
        }
        return false;
      }
      return true;
    }

    // Expectations section
    vm.expectationsSectionStatus = 'disabled';
    vm.expectationsSectionInvalid = false;
    vm.expectationsSectionError = false;
    vm.expectationsSectionTitle = 'Expectations';
    vm.preExpectations = preExpectations;
    vm.processExpectations = processExpectations;
    vm.expectationsRequired = [
      'participantKnowledgeGain', 'participantSkillsGain'
    ];
    vm.expectationsSectionNextDisabled = function() {
      if (vm.working) {
        return true;
      }
      return false;
    };

    // pre
    function preExpectations() {
      vm.working = false;
      vm.editSection('expectations');
    }

    // process
    function processExpectations() {
      if (isValid(vm.expectationsRequired) === false) {
        vm.expectationsSectionInvalid = true;
        return;
      }

      vm.working = true;

      // indicate the participant has completed the form
      vm.participant.Registration_complete__c = true;

      processUpdateParticipant()
      .then(
        function() {
          vm.expectationsSectionStatus = 'complete';
          vm.completeForm();
        },
        function(err) {
          if (vm.debug) {
            console.log('Error processExpectations', err);
          }
          vm.expectationsSectionError = true;
          vm.working = false;
        }
      );
    }

    // Sessions section
    vm.sessions = [];
    vm.sessionsDays = {
      sessionsDaysCount: 0,
      sessionsPeriodsCount: 0
    };
    vm.sessionsPeriodOptions = [
      '1',
      '2'
    ];
    function SessionsDay(day) {
      this.id = day;
      this.periods = {};
      this.periodsCount = 0;
    }
    function SessionsDayPeriod(period) {
      this.id = period;
      this.options = vm.sessionsPeriodOptions;
      this.selectedPreferences = [];
      this.valid = true;
    }
    vm.sessionDayCurrent = null;
    vm.sessionsSectionStatus = 'disabled';
    vm.sessionsSectionInvalid = false;
    vm.sessionsSectionError = false;
    vm.sessionsErrors = {};
    vm.sessionsSectionErrorTop = false;
    vm.sessionsSectionTitle = 'Sessions';
    vm.preSessions = preSessions;
    vm.processSessions = processSessions;
    vm.processSessionsProcessing = {
      processes: 1,
      processing: 1
    };
    // not required for Sessions as there are no additional questions
    // vm.sessionsRequired = [];
    vm.sessionsSectionNextDisabled = function() {
      if (vm.working) {
        return true;
      }
      return false;
    };

    // pre
    function preSessions() {
      vm.working = false;
      vm.editSection('sessions');
    }

    function preQuerySessions() {
      return sessionService.list(
        {
          actionid: vm.action.Id
        }
      )
      .$promise
      .then(
        function(data) {
          vm.sessions = data;
          if (vm.debug) {
            console.log('sessions', vm.sessions);
          }

          var sessionsDay = null;
          var sessionsDayPeriod = null;
          vm.sessionsDays.sessionsDaysCount = 0;
          vm.sessionsDays.sessionsPeriodsCount = 0;
          angular.forEach(vm.sessions, function(session, index) {
            vm.processSessionsProcessing.processes++;
            if (
              sessionsDay === null ||
              sessionsDay.id !== session.Day__c
            ) {
              // it's a new day
              vm.sessionsDays.sessionsDaysCount++;
              sessionsDay = new SessionsDay(session.Day__c);
              vm.sessionsDays[sessionsDay.id] = sessionsDay;
              session.headingDay = session.Day__c;
            }
            session.day = sessionsDay;

            if (
              sessionsDayPeriod === null ||
              sessionsDay.periodsCount === 0 ||
              sessionsDayPeriod.id !== session.Period__c
            ) {
              // it's a new period
              if (vm.debug) {
                console.log('New period');
              }
              sessionsDay.periodsCount++;
              vm.sessionsDays.sessionsPeriodsCount++;
              sessionsDayPeriod = new SessionsDayPeriod(session.Period__c);
              vm.sessionsDays[sessionsDay.id]
                .periods[sessionsDayPeriod.id] = sessionsDayPeriod;
              session.headingPeriod = session.Period__c;
            }
            session.period = sessionsDayPeriod;

            // do we have a sessionParticipation response
            // for some reason vm.participant.sessionParticipations
            // is being overriden somewhere. The below is a temporary fix
            // FIX THE participantSessionsParticipations
            var participant_session_participations = $filter('filter')(
              participantSessionsParticipations,
              {
                Session__c: session.Id
              }
            );
            if (
              participant_session_participations !== null &&
              participant_session_participations.length > 0
            ) {
              session.sessionParticipation =
                participant_session_participations[0];
            } else {
              session.sessionParticipation =
                new sessionParticipationService.SessionParticipation();
            }
          });
          if (vm.debug) {
            console.log('vm.sessions', vm.sessions);
            console.log('vm.sessionsDays', vm.sessionsDays);
            console.log(
              'vm.sessionsPeriodsCount',
              vm.sessionsDays.sessionsPeriodsCount
            );
            console.log(
              'vm.sessionsDaysCount',
              vm.sessionsDays.sessionsDaysCount
            );
          }
          return vm.sessions;
        },
        function(err) {
          return err;
        }
      );
    }

    // process
    function processSessions() {
      vm.sessionsSectionInvalid = false;

      // not required for Sessions as there are no additional questions
      // if (isValid(vm.sessionsRequired) === false) {
      //   vm.sessionsSectionInvalid = true;
      // }

      // special validation for sessions
      angular.forEach(vm.sessionsDays, function(sessionsDay, index) {
        angular.forEach(sessionsDay.periods,
          function(sessionsDayPeriod, index) {
            sessionsDayPeriod.selectedPreferences = [];
          }
        );
      });
      if (vm.debug === true) {
        console.log('vm.sessionsDays', vm.sessionsDays);
      }
      angular.forEach(vm.sessions, function(session, index) {
        if (vm.debug === true) {
          console.log('session', session);
          console.log('session.day.id', session.day.id);
          console.log('session.period.id', session.period.id);
        }
        vm.sessionsDays[session.day.id]
          .periods[session.period.id]
          .selectedPreferences.push(
            session.sessionParticipation.Registration_preference__c
          );
      });
      if (vm.debug === true) {
        console.log('sessionsDays', vm.sessionsDays);
      }
      var periodsValid = 0;
      angular.forEach(vm.sessionsDays, function(sessionsDay, index) {
        angular.forEach(sessionsDay.periods,
          function(sessionsDayPeriod, index) {
            var periodOptionsSelected = 0;
            angular.forEach(
              vm.sessionsPeriodOptions,
              function(option, index) {
                if (
                  $filter('filter')(
                    sessionsDayPeriod.selectedPreferences, option
                  ).length === 1
                ) {
                  periodOptionsSelected++;
                }
              }
            );
            if (periodOptionsSelected === vm.sessionsPeriodOptions.length) {
              sessionsDayPeriod.valid = true;
              periodsValid++;
            } else {
              sessionsDayPeriod.valid = false;
            }
          }
        );
      });
      if (vm.debug === true) {
        console.log('periodsValid', periodsValid);
        console.log(
          'sessionsPeriodsCount',
          vm.sessionsDays.sessionsPeriodsCount
        );
      }
      vm.sessionsSectionInvalid = false;
      if (periodsValid < vm.sessionsDays.sessionsPeriodsCount) {
        vm.sessionsSectionInvalid = true;
      }

      if (vm.sessionsSectionInvalid === true) {
        return;
      }

      vm.working = true;

      // participant information
      // THIS IS DUPLICATED FROM EXPERIENCE
      // NEEDS TO BE REMOVED INTO IT'S OWN FUNCTION AT SOME POINT
      vm.participant.Organisation__c = vm.affiliation.npe5__Organization__c;
      // also indicate that the participant has actually finished the form
      vm.participant.Registration_complete__c = true;

      // reset processing count
      vm.processSessionsProcessing.processing = 1;

      // chaining the promises as responses rely on participant Id
      processSaveParticipant()
      .then(
        function(participant) {
          // q.all works as it doesn't matter the order of processing
          var promises = processSaveSessionParticipations();
          $q.all(promises).then(
            function(data) {
              if (vm.debug) {
                console.log('All promises have resolved', data);
              }

              vm.sessionsSectionStatus = 'complete';
              vm.completeForm();
            },
            function(err) {
              if (vm.debug) {
                console.log('Something went wrong', err);
              }
              vm.sessionsSectionError = true;
              vm.working = false;
            }
          );
        },
        function(err) {
          vm.sessionsSectionError = true;
          vm.working = false;
          if (vm.debug) {
            console.log('There was an error saving the participant', err);
          }
        }
      );
    }

    function processSaveSessionParticipations() {
      var promises = [];
      angular.forEach(vm.sessions, function(session, index) {
        session.sessionParticipation.Status__c = 'Registered';
        session.sessionParticipation.Participant__c = vm.participant.Id;
        session.sessionParticipation.Session__c = session.Id;
        if (vm.debug) {
          console.log('Session ' + index, session.sessionParticipation);
        }
        if (
          session.sessionParticipation.Registration_preference__c !==
            undefined &&
          session.sessionParticipation.Registration_preference__c !== null
        ) {
          promises
            .push(
              processSaveSessionParticipation(session.sessionParticipation)
            );
        }
      });

      return promises;
    }

    function completeForm() {
      // just submit, don't show a summary of all fields
      vm.working = false;
      vm.sectionActive = '';
      vm.expectationsSectionStatus = 'complete';
      vm.formStatus = 'complete';
      layoutService.navigate(null, 'top');
    }

    function processSaveContact() {
      if (vm.debug) {
        console.log('Saving contact', vm.contact);
      }
      return $q(function(resolve, reject) {
        gaService.addSalesforceRequest('Update', 'Contact');
        vm.contact.$update(
          {
            contactid: vm.contact.Id
          },
          function(record) {
            gaService.addSalesforceResponse(
              'Update',
              'Contact'
            );
            if (record.success) {
              resolve(vm.contact);
            } else {
              if (vm.debug) {
                console.log('There was an error updating the contact');
              }
              reject('There was an error updating the contact');
            }
          },
          function(err) {
            gaService.addSalesforceError(
              'Update',
              'Contact',
              err.status
            );
          }
        );
      });
    }

    function processSaveParticipant() {
      if (vm.debug) {
        console.log('Saving participant', vm.participant);
      }
      return $q(function(resolve, reject) {
        if (vm.participant.Id === undefined) {
          if (vm.debug) {
            console.log('processSaveParticipant: Create');
          }
          vm.participant.Type__c = 'Participant';
          vm.participant.Registration_complete__c = false;
          vm.participant.Action__c = vm.action.Id;
          vm.participant.Contact__c = vm.contact.Id;
          gaService.addSalesforceRequest('Create', 'Participant');
          vm.participant.$save(
            function(record) {
              gaService.addSalesforceResponse(
                'Create',
                'Participant'
              );
              if (record.success) {
                if (vm.debug) {
                  console.log('participant Created');
                }
                resolve(vm.participant);
              } else {
                if (vm.debug) {
                  console.log('There was an error creating the participant');
                }
                reject('There was an error creating the participant');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create',
                'Participant',
                err.status
              );
              if (vm.debug) {
                console.log('There was an error creating the participant', err);
              }
              reject(err);
            }
          );
        } else {
          if (vm.debug) {
            console.log('processSaveParticipant: Update');
          }
          gaService.addSalesforceRequest('Update', 'Participant');
          vm.participant.$update(
            {
              participantid: vm.participant.Id
            },
            function(record) {
              gaService.addSalesforceResponse(
                'Update',
                'Participant'
              );
              if (record.success) {
                if (vm.debug) {
                  console.log('participant Updated');
                }
                resolve(vm.participant);
              } else {
                if (vm.debug) {
                  console.log('There was an error updating the participant');
                }
                reject('There was an error updating the participant');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Update',
                'Participant',
                err.status
              );
              if (vm.debug) {
                console.log('There was an error updating the participant', err);
              }
              reject(err);
            }
          );
        }
      });
    }

    function processUpdateParticipant() {
      if (vm.debug) {
        console.log('Updating participant', vm.participant);
      }
      return $q(function(resolve, reject) {
        gaService.addSalesforceRequest('Update', 'Participant');
        vm.participant.$update(
          {
            participantid: vm.participant.Id
          },
          function(record) {
            gaService.addSalesforceResponse(
              'Update',
              'Participant'
            );
            if (record.success) {
              resolve(vm.participant);
            } else {
              if (vm.debug) {
                console.log('There was an error updating the participant');
              }
              reject('There was an error updating the participant');
            }
          },
          function(err) {
            gaService.addSalesforceError(
              'Update',
              'Participant',
              err.status
            );
            if (vm.debug) {
              console.log('There was an error updating the participant', err);
            }
            reject(err);
          }
        );
      });
    }

    function processSaveResponse(response) {
      if (vm.debug) {
        console.log('Saving response', response);
      }
      return $q(function(resolve, reject) {
        if (
          (
            response.Score__c === null ||
            response.Score__c === undefined ||
            response.Score__c === 0
          ) &&
          (
            response.Comments__c === null ||
            response.Comments__c === undefined ||
            response.Comments__c === 0
          )
        ) {
          // don't save it, just send it back
          if (vm.debug) {
            console.log('Response skipped!');
          }
          vm.processExperienceProcessing.processing++;
          resolve(response);
        } else if (response.Id === undefined) {
          gaService.addSalesforceRequest('Create', 'Response');
          response.$save(
            function(record) {
              gaService.addSalesforceResponse(
                'Create',
                'Response'
              );
              if (record.success) {
                vm.processExperienceProcessing.processing++;
                resolve(response);
              } else {
                if (vm.debug) {
                  console.log('There was an error creating the response');
                }
                reject('There was an error creating the response');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create',
                'Response',
                err.status
              );
              if (vm.debug) {
                console.log('There was an error creating the response', err);
              }
              reject(err);
            }
          );
        } else {
          gaService.addSalesforceRequest('Update', 'Response');
          response.$update(
            {
              responseid: response.Id
            },
            function(record) {
              gaService.addSalesforceResponse(
                'Update',
                'Response'
              );
              if (record.success) {
                vm.processExperienceProcessing.processing++;
                resolve(response);
              } else {
                if (vm.debug) {
                  console.log('There was an error updating the response');
                }
                reject('There was an error updating the response');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Update',
                'Response',
                err.status
              );
              if (vm.debug) {
                console.log('There was an error updating the response', err);
              }
              reject(err);
            }
          );
        }
      });
    }

    function processSaveSessionParticipation(sessionParticipation) {
      if (vm.debug) {
        console.log('Saving sessionParticipation', sessionParticipation);
      }
      return $q(function(resolve, reject) {
        if (
          sessionParticipation.Registration_preference__c === null ||
          sessionParticipation.Registration_preference__c === undefined ||
          sessionParticipation.Registration_preference__c === 0
        ) {
          // don't save it, just send it back
          vm.processSessionsProcessing.processing++;
          resolve(sessionParticipation);
        } else if (sessionParticipation.Id === undefined) {
          gaService.addSalesforceRequest('Create', 'SessionParticipation');
          sessionParticipation.$save(
            function(record) {
              if (record.success) {
                gaService.addSalesforceResponse(
                  'Create',
                  'SessionParticipation'
                );
                vm.processSessionsProcessing.processing++;
                resolve(sessionParticipation);
              } else {
                if (vm.debug) {
                  console.log(
                    'There was an error creating the sessionParticipation'
                  );
                }
                reject('There was an error creating the sessionParticipation');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create',
                'SessionParticipation',
                err.status
              );
              if (vm.debug) {
                console.log(
                  'There was an error creating the sessionParticipation',
                  err
                );
              }
              reject(err);
            }
          );
        } else {
          gaService.addSalesforceRequest('Update', 'SessionParticipation');
          sessionParticipation.$update(
            {
              session_participationid: sessionParticipation.Id
            },
            function(record) {
              if (record.success) {
                gaService.addSalesforceResponse(
                  'Update',
                  'SessionParticipation'
                );
                vm.processSessionsProcessing.processing++;
                resolve(sessionParticipation);
              } else {
                if (vm.debug) {
                  console.log(
                    'There was an error updating the sessionParticipation'
                  );
                }
                reject('There was an error updating the sessionParticipation');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Update',
                'SessionParticipation',
                err.status
              );
              if (vm.debug) {
                console.log(
                  'There was an error updating the sessionParticipation',
                  err
                );
              }
              reject(err);
            }
          );
        }
      });
    }

    function isValid(requiredFields) {
      var valid = true;
      angular.forEach(requiredFields, function(field, index) {
        if ($scope.pageForm[field].$invalid) {
          valid = false;
          $scope.pageForm[field].$setTouched();
        }
      });

      return valid;
    }
  }
})();
