/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';
  angular
    .module('app.core')
    .constant('API_URI', ['https://apfapi.herokuapp.com/salesforce']);
    // .constant('API_URI', ['http://localhost:9000/salesforce']);
})();
