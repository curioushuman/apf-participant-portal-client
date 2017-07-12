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

    vm.navigate = layoutService.navigate;

    vm.working = false;

    vm.actionLoaded = false;
    vm.actionError = false;
    vm.actionErrorMessage = {};

    vm.register = register;

    // find the action based on the slug
    vm.action = actionService.retrieve(
      { slug: $routeParams.actionSlug },
      function () {
        console.log('retrieved');
        console.log(vm.action);
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
        console.log('Obtain training partner');
        console.log(vm.action.Training_partner__c);
        vm.action.trainingPartnerAccount = accountService.retrieve(
          { accountid: vm.action.Training_partner__c },
          function () {
            console.log('Found the training partner');
            console.log(vm.action.trainingPartnerAccount);
          },
          function (err) {
            console.log('Training partner could not be found');
          }
        );
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

    // Email section
    vm.contact = {
      Email: ''
    };
    vm.emailSectionActive = true;
    vm.emailSectionComplete = false;
    vm.emailSectionTitle = 'Email';
    vm.processEmail = processEmail;
    vm.emailSectionNextDisabled = function(pageForm) {
      if (vm.working) {
        return true;
      }
      if (vm.contact.Email === '') {
        return true;
      }
      if (pageForm.$invalid) {
        return true;
      }
      return false;
    };

    // process email
    function processEmail() {

      console.log(vm.contact.Email);
      vm.working = true;

      // vm.contact = contactService.retrieve(
      //   { email: vm.contact.Email },
      //   function () {
      //
      //   },
      //   function (err) {
      //
      //   }
      // );

      // see if a contact exists with this email
        // if so populate the form
          // ask the participant to check the values are up to date
      // show the personal form either way

      vm.prePersonal();
    }

    // Personal section
    vm.personalSectionActive = true;
    vm.personalSectionComplete = false;
    vm.personalSectionTitle = 'Personal';
    vm.prePersonal = prePersonal;
    vm.processPersonal = processPersonal;
    vm.salutations = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'];
    vm.genders = ['Male', 'Female', 'Prefer not to disclose'];
    vm.personalSectionNextDisabled = function(pageForm) {
      if (vm.working) {
        return true;
      }
      if (pageForm.$invalid) {
        return true;
      }
      return false;
    };

    // pre
    function prePersonal() {

    }

    // process
    function processPersonal() {

      vm.working = true;

      vm.preOrganisation();
    }

    // Organisation section
    // TODO - actually get the data from somewhere
    vm.nhris = [
      {
        Id: 'balls',
        Name: 'Balls'
      }
    ];
    vm.organisationSectionActive = true;
    vm.organisationSectionComplete = false;
    vm.organisationSectionTitle = 'Organisation';
    vm.preOrganisation = preOrganisation;
    vm.processOrganisation = processOrganisation;
    vm.organisationSectionNextDisabled = function(pageForm) {
      if (vm.working) {
        return true;
      }
      if (pageForm.$invalid) {
        return true;
      }
      return false;
    };

    // pre
    function preOrganisation() {
      // grab the list of NHRIs
      // also see if there is an affiliation for this contact (if one was found)
        // only if a contact is found (determined by existence of contact.Id)
    }

    // process
    function processOrganisation() {

      // when creating the organisation you'll need to
      // use the contact Id that has already been created (or found)

      // you'll also need to update the role / department on the contact
      // as well as the affiliate

      vm.working = true;

      //
      vm.preContact();
    }

    // Contact section
    vm.phoneTypes = ['Work', 'Mobile', 'Home', 'Other'];
    vm.contactSectionActive = true;
    vm.contactSectionComplete = false;
    vm.contactSectionTitle = 'Contact details';
    vm.preContact = preContact;
    vm.processContact = processContact;
    vm.contactSectionNextDisabled = function(pageForm) {
      if (vm.working) {
        return true;
      }
      if (pageForm.$invalid) {
        return true;
      }
      return false;
    };

    // pre
    function preContact() {

    }

    // process
    function processContact() {

      // do the funky email stuff
        // i.e. if they enter an email, we assume the previous email is home
          // we also assume preferred is home email
        // if they enter nothing
          // we assume preferred is work email
          // they have not provided a home email

      // similary, but more simply, with the phone
        // i.e. preferred phone and the phone type we actually have

      vm.working = true;

      //
      vm.preExperience();
    }

    // Experience section
    vm.responses = [];
    vm.experienceSectionActive = true;
    vm.experienceSectionComplete = false;
    vm.experienceSectionTitle = 'Experience';
    vm.preExperience = preExperience;
    vm.processExperience = processExperience;
    vm.experienceSectionNextDisabled = function(pageForm) {
      if (vm.working) {
        return true;
      }
      if (pageForm.$invalid) {
        return true;
      }
      return false;
    };

    // pre
    function preExperience() {

      // grab the self assessment questions for this action

    }

    // process
    function processExperience() {

      vm.working = true;

      //
      vm.preExpectations();
    }

    // Expectations section
    vm.expectationsSectionActive = true;
    vm.expectationsSectionComplete = false;
    vm.expectationsSectionTitle = 'Expectations';
    vm.preExpectations = preExpectations;
    vm.processExpectations = processExpectations;
    vm.expectationsSectionNextDisabled = function(pageForm) {
      if (vm.working) {
        return true;
      }
      if (pageForm.$invalid) {
        return true;
      }
      return false;
    };

    // pre
    function preExpectations() {

    }

    // process
    function processExpectations() {

      vm.working = true;

      //
    }

    function register() {

    }

  }
})();
