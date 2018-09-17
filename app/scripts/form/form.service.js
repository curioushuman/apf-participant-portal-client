/* eslint no-unused-vars: 0 */
/* eslint quotes: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .factory('formService', formService);

  formService.$inject = [

  ];

  function formService(

  ) {
    var debug = false;

    var service = {
      genders: genders,
      phoneTypes: phoneTypes,
      salutations: salutations
    };

    function salutations() {
      return ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.', 'Atty.', 'Hon. Just.'];
    }

    function genders() {
      return ['Male', 'Female', 'Another term', 'Prefer not to disclose'];
    }

    function phoneTypes() {
      return ['Work', 'Mobile', 'Home', 'Other'];
    }

    return service;
  }
})();
