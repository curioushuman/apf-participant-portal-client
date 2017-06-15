/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout', [])
    .run(runFunction);

  runFunction.$inject = ['layoutService'];

  function runFunction(layoutService) {

  }
})();
