/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* eslint no-negated-condition: 0 */
/* global angular */
(function() {
  'use strict';

  ContactsSectionEditController.$inject = [
    '$scope',
    '$mdDialog',
    'DEBUG'
  ];

  function ContactsSectionEditController(
    $scope,
    $mdDialog,
    DEBUG
  ) {

    var vm = this;

    vm.hide = function() {
      $mdDialog.hide();
    };

    vm.cancel = function() {
      $mdDialog.cancel();
    };

    vm.save = function() {
      $mdDialog.hide();
    };
  }
})();
