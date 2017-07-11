/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('gzHero', gzHero);

  function gzHero() {
    return {
      templateUrl: 'scripts/layout/directives/hero.template.html'
    };
  }
})();
