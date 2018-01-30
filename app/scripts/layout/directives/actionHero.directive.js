/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('gzActionHero', gzActionHero);

  gzActionHero.$inject = [
    'layoutService'
  ];

  function gzActionHero(layoutService) {
    return {
      templateUrl: 'scripts/layout/directives/actionHero.template.html',
      restrict: 'E',
      controller: ActionHeroController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        action: '='
      }
    };
  }

  ActionHeroController.$inject = [];

  function ActionHeroController() {
    var vm = this;
  }
})();
