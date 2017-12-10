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
      retrieve: Contact.get,
      save: save
    };

    return service;

    function save(contact) {
      if (DEBUG) {
        console.log('Saving contact', contact);
      }
      return $q(function(resolve, reject) {
        if (contact.Id === undefined) {
          if (DEBUG) {
            console.log('CREATING contact record');
          }
          gaService.addSalesforceRequest('Create', 'Contact');
          contact.$save(
            function(record) {
              gaService.addSalesforceResponse(
                'Create',
                'Contact'
              );
              if (record.success) {
                if (DEBUG) {
                  console.log('contact Created');
                }
                contact.Id = record.Id;
                resolve(contact);
              } else {
                if (DEBUG) {
                  console.log('There was an error creating the contact');
                }
                reject('There was an error creating the contact');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create',
                'Contact',
                err.status
              );
              if (DEBUG) {
                console.log('There was an error creating the contact', err);
              }
              reject(err);
            }
          );
        } else {
          if (DEBUG) {
            console.log('UPDATING contact record');
          }
          gaService.addSalesforceRequest('Update', 'Contact');
          contact.$update(
            {
              contactid: contact.Id
            },
            function(record) {
              gaService.addSalesforceResponse(
                'Update',
                'Contact'
              );
              if (record.success) {
                if (DEBUG) {
                  console.log('contact Updated');
                }
                resolve(contact);
              } else {
                if (DEBUG) {
                  console.log('There was an error updating the contact');
                }
                reject('There was an error updating the contact');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Update',
                'Contact',
                err.status
              );
              if (DEBUG) {
                console.log('There was an error updating the contact', err);
              }
              reject(err);
            }
          );
        }
      });
    }
  }
})();
