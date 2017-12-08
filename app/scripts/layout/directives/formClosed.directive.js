/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('gzFormClosed', gzFormClosed);

  gzFormClosed.$inject = [
    'layoutService'
  ];

  function gzFormClosed(layoutService) {
    return {
      templateUrl:
        'scripts/layout/directives/formClosed.template.html',
      restrict: 'E',
      controller: FormClosedController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        status: '=',
        ownerId: '='
      }
    };
  }

  FormClosedController.$inject = [
    '$scope',
    'layoutService',
    'userService',
    'DEBUG'
  ];

  function FormClosedController(
    $scope,
    layoutService,
    userService,
    DEBUG
  ) {
    var vm = this;
    vm.show = false;

    $scope.$watch('vm.status', function(value) {
      console.log('value', value);
      if (value === 'closed') {
        vm.show = true;
        vm.owner = userService.retrieve(
          {
            uid: vm.ownerId
          },
          function() {
            if (DEBUG) {
              console.log('success vm.owner', vm.owner);
            }
          },
          function(err) {
            if (DEBUG) {
              console.log('Error obtaining owner', err);
            }
            gaService.addSalesforceError(
              'Retrieve',
              'User',
              err.status
            );
          }
        );
      }
    });
  }
})();
