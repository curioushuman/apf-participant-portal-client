/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzClosed', gzClosed);

  gzClosed.$inject = [
    'layoutService'
  ];

  function gzClosed(layoutService) {
    return {
      templateUrl:
        'scripts/form/directives/closed.template.html',
      restrict: 'E',
      controller: ClosedController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        status: '=',
        ownerId: '='
      }
    };
  }

  ClosedController.$inject = [
    '$scope',
    'gaService',
    'layoutService',
    'userService',
    'DEBUG'
  ];

  function ClosedController(
    $scope,
    gaService,
    layoutService,
    userService,
    DEBUG
  ) {
    var vm = this;
    vm.show = false;

    $scope.$watch('vm.status', function(value) {
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
              'Retrieve User',
              vm.ownerId,
              err.status
            );
          }
        );
      }
    });
  }
})();
