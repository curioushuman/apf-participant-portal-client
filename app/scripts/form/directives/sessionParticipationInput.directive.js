/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive(
      'gzSessionParticipationInput',
      gzSessionParticipationInput
    );

  gzSessionParticipationInput.$inject = [
    'layoutService'
  ];

  function gzSessionParticipationInput(layoutService) {
    return {
      templateUrl:
        'scripts/form/directives/sessionParticipationInput.template.html',
      restrict: 'E',
      controller: SessionParticipationInputController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        session: '=',
        sessionsDays: '=',
        first: '='
      }
    };
  }

  SessionParticipationInputController.$inject = [
    'layoutService'
  ];

  function SessionParticipationInputController(
    layoutService
  ) {
    var vm = this;

    vm.focus = '';
    if (vm.first) {
      vm.focus = 'sessions';
    }

    vm.navigate = layoutService.navigate;
  }
})();
