/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('contactService', contactService);

  contactService.$inject = [
    '$resource',
    'API_URI'
  ];

  function contactService($resource, API_URI) {

    var Contact = $resource(API_URI + '/contact/:email',
      { email: '@email' }
    );

    var service = {
      retrieve: Contact.get
    };

    return service;
  }
})();
