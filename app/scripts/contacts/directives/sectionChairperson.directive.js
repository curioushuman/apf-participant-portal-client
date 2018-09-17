/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* eslint no-negated-condition: 0 */
/* global angular */

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
    '$timeout',
    'accountService',
    'affiliationService',
    'contactService',
    'gaService',
    'DEBUG'
  ];

  function ContactsSectionChairpersonController(
    $q,
    $scope,
    $timeout,
    accountService,
    affiliationService,
    contactService,
    gaService,
    DEBUG
  ) {
    var vm = this;
    vm.section = vm.page.sections.chairperson;
    vm.section.required = [];
    vm.page.sectionReady('chairperson');

    // as with all sections the model is
    // we do / load things in the pre(load) function that we need to
    // that pertain to this section
    // store them at the page level in case they might be useful in other
    // sections
    vm.section.pre = function() {
      return $q(function(resolve, reject) {
        resolve(true);
      });
    };

    // then when save / next is hit the process function is called
    // this is where we do the saving
    vm.section.process = function() {
      return $q(function(resolve, reject) {
        resolve(true);
      });
    };
  }
})();
