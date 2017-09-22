/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive(
      'gzSessionParticipationFormInput',
      gzSessionParticipationFormInput
    );

  gzSessionParticipationFormInput.$inject = [
    'layoutService'
  ];

  function gzSessionParticipationFormInput(layoutService) {
    return {
      templateUrl:
        'scripts/layout/directives/sessionParticipationFormInput.template.html',
      restrict: 'E',
      controller: SessionParticipationFormInputController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        session: '=',
        displayDayHeadings: '=',
        sessionsDays: '='
      }
    };
  }

  SessionParticipationFormInputController.$inject = [
    'layoutService'
  ];

  function SessionParticipationFormInputController(
    layoutService
  ) {
    var vm = this;

    vm.navigate = layoutService.navigate;
  }
})();
