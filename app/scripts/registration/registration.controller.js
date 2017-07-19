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
    vm.openAll = false;

    vm.navigate = layoutService.navigate;

    vm.working = false;

    vm.actionLoaded = false;
    vm.actionError = false;
    vm.actionErrorMessage = {};

    vm.register = register;

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
        // split based on new line
        // turn it into an array
        // make it a list
        // vm.action.Selection_criteria__c

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
    // vm.contact = {
    //   Email: ''
    // };
    vm.contactExists = false;
    vm.emailSectionError = false;
    vm.emailSectionStatus = 'disabled';
    vm.emailSectionTitle = 'Email';
    vm.processEmail = processEmail;
    vm.emailSectionNextDisabled = function(pageForm) {
      if (vm.working) {
        return true;
      }
      if (vm.email === '') {
        return true;
      }
      if (pageForm.contactEmail.$invalid) {
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
    vm.personalSectionNextDisabled = function(pageForm) {
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
    function processPersonal(pageForm) {

      if (
        pageForm.contactFirstName.$invalid
        || pageForm.contactLastName.$invalid
        || pageForm.contactSalutation.$invalid
        || pageForm.contactGender.$invalid
      ) {
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
    vm.organisationSectionTitle = 'Organisation';
    vm.preOrganisation = preOrganisation;
    vm.processOrganisation = processOrganisation;
    vm.organisationSectionNextDisabled = function(pageForm) {
      if (vm.working) {
        return true;
      }
      return false;
    };

    // pre
    function preOrganisation() {

      if (vm.contactExists) {
        vm.affiliation = affiliationService.retrievePrimary(
          { contactid: vm.contact.Id },
          function () {
            vm.working = false;
            vm.editSection('organisation');
          },
          function (err) {
            console.log('There was an error retrieving the contact');
            console.log(err);
          }
        );
      } else {
        vm.working = false;
        vm.editSection('organisation');
      }

      // grab the list of NHRIs
      // also see if there is an affiliation for this contact (if one was found)
        // only if a contact is found (determined by existence of contact.Id)
    }

    // process
    function processOrganisation(pageForm) {

      if (
        pageForm.affiliationOrganisation.$invalid
        || pageForm.affiliationStartDate.$invalid
        || pageForm.affiliationRole.$invalid
        || pageForm.affiliationDepartment.$invalid
      ) {
        vm.organisationSectionInvalid = true;
        return;
      }

      // when creating the affiliation you'll need to
      // use the contact Id that has already been created (or found)

      // you'll also need to update the role / department on the contact
      // as well as the affiliation

      vm.working = true;

      vm.organisationSectionStatus = 'complete';

      //
      vm.preContact();
    }

    // Contact section
    vm.phoneTypes = ['Work', 'Mobile', 'Home', 'Other'];
    vm.contactSectionStatus = 'disabled';
    vm.contactSectionInvalid = false;
    vm.contactSectionError = false;
    vm.contactSectionTitle = 'Contact details';
    vm.preContact = preContact;
    vm.processContact = processContact;
    vm.contactSectionNextDisabled = function(pageForm) {
      if (vm.working) {
        return true;
      }
      return false;
    };

    // pre
    function preContact() {
      vm.working = false;
      vm.editSection('contact');
    }

    // process
    function processContact(pageForm) {

      if (
        pageForm.contactPhone.$invalid
        || pageForm.contactPreferredPhone.$invalid
        || pageForm.contactClosestAirport.$invalid
      ) {
        vm.contactSectionInvalid = true;
        return;
      }

      // do the funky email stuff
        // i.e. if they enter an email, we assume the previous email is home
          // we also assume preferred is home email
        // if they enter nothing
          // we assume preferred is work email
          // they have not provided a home email

      // similary, but more simply, with the phone
        // i.e. preferred phone and the phone type we actually have

      vm.working = true;

      vm.contactSectionStatus = 'complete';

      //
      vm.preExperience();
    }

    // Experience section
    vm.responses = [];
    vm.experienceSectionStatus = 'disabled';
    vm.experienceSectionInvalid = false;
    vm.experienceSectionError = false;
    vm.experienceSectionTitle = 'Experience';
    vm.preExperience = preExperience;
    vm.processExperience = processExperience;
    vm.experienceSectionNextDisabled = function(pageForm) {
      if (vm.working) {
        return true;
      }
      return false;
    };

    // pre
    function preExperience() {
      vm.working = false;
      vm.editSection('experience');
      // grab the self assessment questions for this action
      // don't forget to include the help text in the output (if it exists)
    }

    // process
    function processExperience(pageForm) {

      if (
        pageForm.participantPriorExperienceTopic.$invalid
      ) {
        vm.experienceSectionInvalid = true;
        return;
      }

      // process the questions
        // and save the responses
      // save for the contact as well
      // and for the participant I believe

      vm.working = true;

      vm.experienceSectionStatus = 'complete';

      //
      vm.preExpectations();
    }

    // Expectations section
    vm.expectationsSectionStatus = 'disabled';
    vm.expectationsSectionInvalid = false;
    vm.expectationsSectionError = false;
    vm.expectationsSectionTitle = 'Expectations';
    vm.preExpectations = preExpectations;
    vm.processExpectations = processExpectations;
    vm.expectationsSectionNextDisabled = function(pageForm) {
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
    function processExpectations(pageForm) {

      if (
        pageForm.participantKnowledgeGain.$invalid
        || pageForm.participantSkillsGain.$invalid
      ) {
        vm.expectationsSectionInvalid = true;
        return;
      }

      // save the participant

      vm.working = true;

      vm.expectationsSectionStatus = 'complete';

      //
    }

    function register() {

      // just submit, don't show a summary of all fields

    }

  }
})();
