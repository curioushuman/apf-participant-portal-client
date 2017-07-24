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
    var Contact = $resource(API_URI + '/contact',
      {},
      {
        get: {
          method: 'GET',
          url: API_URI + '/contact/:email',
          params: {
            email: '@email'
          }
        },
        update: {
          method: 'PUT',
          url: API_URI + '/contact/:contactid',
          params: {
            contactid: '@contactid'
          }
        }
      }
    );

    var service = {
      Contact: Contact,
      retrieve: Contact.get
    };

    return service;
  }
})();
