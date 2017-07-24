/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
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
    '$mdDateLocale',
    'layoutService',
    'actionService',
    'contactService',
    'accountService',
    'affiliationService',
    'participantService',
    'questionService',
    'responseService'
  ];

  function RegistrationController(
    $routeParams,
    $scope,
    $q,
    $location,
    $filter,
    $mdDateLocale,
    layoutService,
    actionService,
    contactService,
    accountService,
    affiliationService,
    participantService,
    questionService,
    responseService
  ) {
    var vm = this;

    // debugging / developing
    vm.debug = true;
    vm.openAll = false;

    vm.navigate = layoutService.navigate;

    vm.working = false;
    vm.formComplete = false;
    vm.completeForm = completeForm;

    vm.actionLoaded = false;
    vm.actionError = false;
    vm.actionErrorMessage = {};

    // date stuff
    $mdDateLocale.formatDate = function(date) {
      return $filter('date')(date, "dd/MM/yyyy");
    };

    // find the action based on the slug
    vm.action = actionService.retrieve(
      { slug: $routeParams.actionSlug },
      function () {
        // console.log('retrieved');
        // console.log(vm.action);
        vm.actionLoaded = true;

        // work out the correct start and end dates
        vm.action.datesShow = false;
        if (vm.action.Digital_component__c === true) {
          vm.action.startDate = vm.action.Digital_start_date__c;
        } else {
          vm.action.startDate = vm.action.Face_to_face_start_date__c;
        }
        if (vm.action.Face_to_face_component__c === true) {
          vm.action.finishDate = vm.action.Face_to_face_finish_date__c;
        } else {
          vm.action.finishDate = vm.action.Digital_finish_date__c;
        }
        if (vm.action.startDate !== null && vm.action.finishDate !== null) {
          vm.action.datesShow = true;
          vm.action.startDate = layoutService.formatDate(vm.action.startDate);
          vm.action.finishDate = layoutService.formatDate(vm.action.finishDate);
        }

        // see if there is a due date
        vm.action.registrationDateShow = false;
        if (vm.action.Registrations_due_date__c !== null) {
          vm.action.registrationDateShow = true;
          vm.action.registrationDate =
            layoutService.formatDate(vm.action.Registrations_due_date__c);
        }

        // sort out the selection criteria
        vm.hasSelectionCriteria = false;
        if (vm.action.Selection_criteria__c !== null) {
          vm.hasSelectionCriteria = true;
          vm.selectionCriteria = vm.action.Selection_criteria__c.split("\n");
        }

        // grab the training partner of the action
        // TODO Needs review aftre we've changed how training partners work in SF
        // console.log('Obtain training partner');
        // console.log(vm.action.Training_partner__c);
        // vm.action.trainingPartnerAccount = accountService.retrieve(
        //   { accountid: vm.action.Training_partner__c },
        //   function () {
        //     console.log('Found the training partner');
        //     console.log(vm.action.trainingPartnerAccount);
        //   },
        //   function (err) {
        //     console.log('Training partner could not be found');
        //   }
        // );
      },
      function (err) {
        console.log(err);
        if (err.status = 404) {
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

    vm.sectionActive = 'email';

    vm.editSection = function(section) {
      vm.sectionActive = section;
      layoutService.navigate(null,section);
    }

    // Email section
    if (vm.debug) {
      vm.email = 'mike@curioushuman.com.au'; // TESTING
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

      console.log(vm.email);
      vm.working = true;

      vm.contact = contactService.retrieve(
        { email: vm.email },
        function () {
          vm.contactExists = true;
          console.log('Contact found');
          vm.emailSectionStatus = 'complete';
          vm.prePersonal();
        },
        function (err) {
          console.log('There was an error retrieving the contact');
          console.log(err);

          if (err.status === 404) {
            // carry on through, we just didn't find a record
            // create a new Contact object
            vm.contact = new contactService.Contact(
              { email: vm.email }
            );
            vm.emailSectionStatus = 'complete';
            vm.prePersonal();
          } else {
            vm.emailSectionError = true;
          }

        }
      );
    }

    // Personal section
    vm.personalSectionStatus = 'disabled';
    vm.personalSectionInvalid = false;
    vm.personalSectionError = false;
    vm.personalSectionTitle = 'Personal information';
    vm.prePersonal = prePersonal;
    vm.processPersonal = processPersonal;
    vm.salutations = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'];
    vm.genders = ['Male', 'Female', 'Other', 'Prefer not to disclose'];
    vm.personalRequired = [
      'contactFirstName','contactLastName',
      'contactSalutation','contactGender'
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
        vm.contact.$save(
          function(record) {
            if (record.success) {
              vm.personalSectionStatus = 'complete';
              vm.preOrganisation();
            } else {
              vm.personalSectionError = true;
              console.log('There was an error creating the contact');
              console.log(err);
            }
          },
          function(err) {
            if (vm.debug) {
              console.log('There was an error creating the contact', err);
            }
          }
        );
      } else {
        vm.contact.$update(
          { contactid: vm.contact.Id },
          function(record) {
            if (record.success) {
              vm.personalSectionStatus = 'complete';
              vm.preOrganisation();
            } else {
              vm.personalSectionError = true;
              console.log('There was an error updating the contact');
              console.log(err);
            }
          }
        );
      }
    }

    // Organisation section
    // TODO - actually get the data from somewhere
    vm.nhris = [
      {
        Id: 'nhri',
        Name: 'An NHRI and stuff'
      }
    ];
    vm.organisationSectionStatus = 'disabled';
    vm.organisationSectionInvalid = false;
    vm.organisationSectionError = false;
    vm.organisationSectionErrorTop = false;
    vm.organisationSectionTitle = 'Organisation';
    vm.preOrganisation = preOrganisation;
    vm.processOrganisation = processOrganisation;
    vm.organisationRequired = [
      'affiliationOrganisation','affiliationStartDate',
      'affiliationRole','affiliationDepartment'
    ];
    vm.organisationSectionNextDisabled = function() {
      if (vm.working) {
        return true;
      }
      return false;
    };

    // pre
    function preOrganisation() {
      vm.working = false;
      vm.organisationSectionErrorTop = false;
      if (vm.debug) {
        console.log('preOrganisation');
      }

      // chaining the promises as affiliation NRHI check relies on NHRI list
      preQueryNhris()
      .then(
        function(nhris) {
          preRetrieveAffiliation();
        },
        function(err) {
          vm.organisationSectionErrorTop = true;
          if (vm.debug) {
            console.log('There was an error retrieving the NHRIs', err);
          }
        }
      )
      .then(
        function(affiliation) {
          vm.working = false;
          vm.editSection('organisation');
        },
        function(err) {
          vm.organisationSectionErrorTop = true;
          if (vm.debug) {
            console.log('There was an error retrieving the affiliation', err);
          }
        }
      );
    }

    function preQueryNhris() {

      return accountService.listByType(
        { type: 'National Human Rights Institution' }
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

    function preRetrieveAffiliation() {

      return $q(function(resolve, reject) {
        if (vm.contactExists) {
          vm.affiliation = affiliationService.retrievePrimary(
            { contactid: vm.contact.Id },
            function () {
              vm.affiliation.npe5__StartDate__c =
                new Date(vm.affiliation.npe5__StartDate__c);
              if (vm.debug) {
                console.log('found affiliation', vm.affiliation);
              }
              if (affiliationService.isNhri(vm.affiliation, vm.nhris) === false) {
                vm.affiliation = new affiliationService.Affiliation();
                if (vm.debug) {
                  console.log('Not an NHRI though', vm.affiliation);
                }
              } else {
                // save this to see if it is actually modified
                vm.affiliationFound = {
                  npe5__Organization__c: vm.affiliation.npe5__Organization__c,
                  npe5__Role__c: vm.affiliation.npe5__Role__c,
                  Department__c: vm.affiliation.Department__c,
                  npe5__StartDate__c: vm.affiliation.npe5__StartDate__c
                };
              }
              resolve(vm.affiliation);
            },
            function (err) {
              if (err.status !== 404) {
                // we don't are about 404, there may not be a record and that ok
                reject(err);
              }
            }
          );
        } else {
          vm.affiliation = new affiliationService.Affiliation();
          if (vm.debug) {
            console.log('Contact does not exist, creating empty affiliation', vm.affiliation);
          }
          resolve(vm.affiliation);
        }
      });
    }

    // process
    function processOrganisation() {

      if (isValid(vm.organisationRequired) === false) {
        vm.organisationSectionInvalid = true;
        return;
      }

      vm.working = true;

      // update some contact fields
      vm.contact.Department = vm.affiliation.Department__c;
      vm.contact.Title = vm.affiliation.npe5__Role__c;

      // and some affiliation fields
      vm.affiliation.npe5__Contact__c = vm.contact.Id;

      // q.all works as it doesn't matter the order of processing
      $q.all([
        processSaveAffiliation(),
        processSaveContact()
      ]).then(
        function(data) {
          if (vm.debug) {
            console.log('Both promises have resolved', data);
          }

          // set the date on the affiliation to be an object again
          vm.affiliation.npe5__StartDate__c =
            new Date(vm.affiliation.npe5__StartDate__c);

          vm.organisationSectionStatus = 'complete';
          vm.preContact();
        },
        function(err) {
          if (vm.debug) {
            console.log('Something went wrong', err);
          }
          vm.organisationSectionError = true;
          vm.working = false;
        }
      );
    }

    function processSaveAffiliation() {
      if (vm.debug) {
        console.log('Saving affiliation', vm.affiliation);
      }
      return $q(function(resolve, reject) {
        if (vm.affiliationFound === undefined) {
          vm.affiliation.npe5__Primary__c = true;
          vm.affiliation.npe5__Status__c = 'Current';
          vm.affiliation.$save(
            function(record) {
              if (record.success) {
                resolve(vm.affiliation);
              } else {
                if (vm.debug) {
                  console.log('There was an error creating the affiliation', err);
                }
                reject('An error occurred creating the affiliation');
              }
            },
            function(err) {
              if (vm.debug) {
                console.log('There was an error creating the affiliation', err);
              }
              reject(err);
            }
          );
        } else {
          if (affiliationService.equalsOrganisation(
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
            vm.affiliation.$save(
              function(record) {
                if (record.success) {
                  resolve(vm.affiliation);
                } else {
                  if (vm.debug) {
                    console.log('There was an error creating the NEW affiliation', err);
                  }
                  reject('An error occurred creating the NEW affiliation');
                }
              },
              function(err) {
                if (vm.debug) {
                  console.log('There was an error creating the NEW affiliation', err);
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
            vm.affiliation.$update(
              { affiliationid: vm.affiliation.Id },
              function(record) {
                if (record.success) {
                  resolve('Affiliation updated');
                } else {
                  if (vm.debug) {
                    console.log('There was an error updating the affiliation', err);
                  }
                  reject('An error occurred updating the affiliation');
                }
              },
              function(err) {
                if (vm.debug) {
                  console.log('There was an error updating the affiliation', err);
                }
                reject(err);
              }
            );
          } else {
            if (vm.debug) {
              console.log('Affiliation unchanged, do not save');
            }
            resolve(vm.affiliation);
          }
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
      'contactPhone','contactPreferredPhone','contactClosestAirport'
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

      vm.working = false;
      vm.editSection('contact');
    }

    // process
    function processContact() {

      if (isValid(vm.contactRequired) === false) {
        vm.contactSectionInvalid = true;
        return;
      }

      vm.working = true;

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
          vm.preExperience();
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
    }

    // Experience section
    vm.questions = [];
    vm.participant = new participantService.Participant();
    vm.experienceSectionStatus = 'disabled';
    vm.experienceSectionInvalid = false;
    vm.experienceSectionError = false;
    vm.experienceSectionErrorTop = false;
    vm.experienceSectionTitle = 'Experience';
    vm.preExperience = preExperience;
    vm.processExperience = processExperience;
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

      preQueryQuestions()
      .then(
        function() {
          vm.working = false;
          vm.editSection('experience');
        },
        function(err) {
          if (vm.debug) {
            console.log('Error preExperience', err);
          }
          vm.experienceSectionErrorTop = true;
          vm.working = false;
        }
      );
    }

    function preQueryQuestions() {

      return questionService.list(
        { actionid: vm.action.Id }
      )
      .$promise
      .then(
        function(data) {
          vm.questions = data;
          if (vm.debug) {
            console.log(vm.questions);
          }
          angular.forEach(vm.questions, function(question, index) {
            question.response = new responseService.Response();
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

      if (isValid(vm.experienceRequired) === false) {
        vm.experienceSectionInvalid = true;
        return;
      }

      vm.working = true;

      // participant information
      vm.participant.Contact__c = vm.contact.Id;
      vm.participant.Action__c = vm.action.Id;
      vm.participant.Organisation__c = vm.affiliation.npe5__Organization__c;
      vm.participant.Type__c = 'Participant';

      // chaining the promises as responses rely on participant Id
      processSaveParticipant()
      .then(
        function(participant) {
          // q.all works as it doesn't matter the order of processing
          var promises = processSaveResponses();
          promises.push(processSaveContact());
          $q.all(promises).then(
            function(data) {
              if (vm.debug) {
                console.log('All promises have resolved', data);
              }

              vm.experienceSectionStatus = 'complete';
              vm.preExpectations();
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
        if (vm.debug) {
          console.log('Response ' + index, question.response);
        }
        promises.push(processSaveResponse(question.response));
      });

      return promises;
    }

    // Expectations section
    vm.expectationsSectionStatus = 'disabled';
    vm.expectationsSectionInvalid = false;
    vm.expectationsSectionError = false;
    vm.expectationsSectionTitle = 'Expectations';
    vm.preExpectations = preExpectations;
    vm.processExpectations = processExpectations;
    vm.expectationsRequired = [
      'participantKnowledgeGain','participantSkillsGain'
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

    function completeForm() {

      // just submit, don't show a summary of all fields
      vm.working = false;
      vm.sectionActive = '';
      vm.expectationsSectionStatus = 'complete';
      vm.formComplete = true;

    }

    function processSaveContact() {
      if (vm.debug) {
        console.log('Saving contact', vm.contact);
      }
      return $q(function(resolve, reject) {
        vm.contact.$update(
          { contactid: vm.contact.Id },
          function(record) {
            if (record.success) {
              resolve(vm.contact);
            } else {
              if (vm.debug) {
                console.log('There was an error updating the contact', err);
              }
              reject(err);
            }
          }
        );
      });
    }

    function processSaveParticipant() {
      if (vm.debug) {
        console.log('Saving participant', vm.participant);
      }
      return $q(function(resolve, reject) {
        vm.participant.$save(
          function(record) {
            if (record.success) {
              resolve(vm.participant);
            } else {
              if (vm.debug) {
                console.log('There was an error creating the participant', err);
              }
              reject(err);
            }
          },
          function(err) {
            if (vm.debug) {
              console.log('There was an error creating the participant', err);
            }
            reject(err);
          }
        );
      });
    }

    function processUpdateParticipant() {
      if (vm.debug) {
        console.log('Updating participant', vm.participant);
      }
      return $q(function(resolve, reject) {
        vm.participant.$update(
          { participantid: vm.participant.Id },
          function(record) {
            if (record.success) {
              resolve(vm.participant);
            } else {
              if (vm.debug) {
                console.log('There was an error updating the participant', err);
              }
              reject(err);
            }
          },
          function(err) {
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
        response.$save(
          function(record) {
            if (record.success) {
              resolve(response);
            } else {
              if (vm.debug) {
                console.log('There was an error creating the response', err);
              }
              reject(err);
            }
          },
          function(err) {
            if (vm.debug) {
              console.log('There was an error creating the response', err);
            }
            reject(err);
          }
        );
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
