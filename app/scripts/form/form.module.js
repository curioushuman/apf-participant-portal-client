/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form', [])
    .run(runFunction);

  runFunction.$inject = ['formService'];

  function runFunction(formService) {

  }
})();
