/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* eslint no-negated-condition: 0 */
/* global angular */
/* global document */

// this is an example of an empty shell of a form section
// please check out the gzSection directive which is a wrapper
// the wrapper does a lot of consistent things for sections
// these inner parts just do what's specific to this section
// they all have a pre(load) function, and a process function
// they all have access to vm.page which is shared amongst all sections
// to store information that would be useful across sections
// and vm.section which can relate to itself, or it's wrapper
// this is for information / data specific to this section
// when you create a new section you'll need to
// - include it in index.pug
// - include it in the contacts controller sections list
// - include it in the contacts.view.pug
(function() {
  'use strict';

  angular
    .module('app.contacts')
    .directive('gzContactsSectionChairperson', gzContactsSectionChairperson);

  gzContactsSectionChairperson.$inject = [

  ];

  function gzContactsSectionChairperson() {
    return {
      require: '^^gzSection',
      controller: ContactsSectionChairpersonController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl:
        'scripts/contacts/directives/sectionChairperson.template.html',
      restrict: 'E',
      scope: {
        page: '=',
        form: '='
      },
      link: function(scope, elem, attrs, sectionCtrl) {
        sectionCtrl.section = sectionCtrl.page.sections.chairperson;
        sectionCtrl.section.sectionCtrl = sectionCtrl;
      }
    };
  }

  // you will need to include the relevant services that are necessary
  // for this section
  ContactsSectionChairpersonController.$inject = [
    '$q',
    '$scope',
    '$mdDialog',
    'formService',
    'gaService',
    'DEBUG'
  ];

  function ContactsSectionChairpersonController(
    $q,
    $scope,
    $mdDialog,
    formService,
    gaService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.chairperson;
    vm.section.required = [];
    vm.page.sectionReady('chairperson');

    vm.page.salutations = formService.salutations();

    // this is a temporary fix in place to illustrate how the section
    // should behave. Don't use this, find a better way.
    vm.section.editStatus = false;
    vm.section.deleteStatus = false;
    vm.section.searchStatus = false;
    vm.section.editPerson = function() {
      vm.section.editStatus = true;
    };
    vm.section.deletePerson = function() {
      vm.section.deleteStatus = true;
    };
    vm.section.searchPerson = function() {
      vm.section.searchStatus = true;
    };

    // as with all sections the model is
    // we do / load things in the pre(load) function that we need to
    // that pertain to this section
    // store them at the page level in case they might be useful in other
    // sections
    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        // things you might need to do
        // NOTE: this is not an exhaustive list
        // I was just gathering thoughts as I was preparing the
        // form code examples
        // - obtain affilitations for vm.page.organisation
        // - obtain the contact record for the chairperson affiliation
        //   (if one exists)

        resolve(true);
      });
    };

    // then when save / next is hit the process function is called
    // this is where we do the saving
    vm.section.process = function() {
      return $q(function(resolve, reject) {
        // some (hopefully) helpful notes
        // Look at form/directives/sectionContact.directive.js for examples
        // Look at form/directives/sectionPersonal.directive.js for examples

        resolve(true);
      });
    };

    // I have started work on this so you can see what the dialog should
    // look like. You'll need to make it function.
    // for more info check out
    // https://material.angularjs.org/latest/demo/dialog
    // https://material.angularjs.org/latest/api/service/$mdDialog
    // PLEASE FIX: controllerUrl doesn't work
    // if you can figure it out that'd be amazing!
    vm.section.deleteDialog = function(ev) {
      $mdDialog.show({
        controller: ContactsSectionDeleteController,
        // controllerUrl:
        // 'scripts/contacts/directives/' +
        // 'sectionDelete.dialog.js',
        controllerAs: 'vm',
        bindToController: true,
        templateUrl:
          'scripts/contacts/directives/' +
          'sectionDelete.dialog.template.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        locals: {
          section: vm.section
        },
        clickOutsideToClose: true
      })
      .then(function() {
        if (DEBUG) {
          console.log('Delete dialog saved');
        }
      }, function() {
        console.log('Delete dialog cancelled');
      });
    };
  }

  // I've had to include the controller code here for now
  // I'd prefer it to be in it's own file
  // I don't know if controllerUrl is going to do it
  // but I didn't have time to find the right answer
  ContactsSectionDeleteController.$inject = [
    '$scope',
    '$mdDialog',
    'DEBUG',
    'section'
  ];

  function ContactsSectionDeleteController(
    $scope,
    $mdDialog,
    DEBUG,
    section
  ) {
    var vm = this;

    // grab locals
    vm.section = section;

    vm.hide = function() {
      $mdDialog.hide();
    };

    // you'll need to undelete the person if they hit cancel
    vm.cancel = function() {
      $mdDialog.cancel();
    };

    // NOTE: you'll need to do some custom validation on this one
    // to make sure that at least one of the options is chosen
    vm.save = function() {
      vm.section.deletePerson();
      $mdDialog.hide();
    };
  }
})();
