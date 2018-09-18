/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* eslint no-negated-condition: 0 */
/* global angular */
(function() {
  'use strict';

  ContactsSectionDeleteController.$inject = [
    '$scope',
    '$mdDialog',
    'DEBUG',
    'page',
    'section'
  ];

  function ContactsSectionDeleteController(
    $scope,
    $mdDialog,
    DEBUG,
    page,
    section
  ) {
    var vm = this;

    // locals
    vm.page = page;
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
      $mdDialog.hide();
    };
  }
})();
