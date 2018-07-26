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
    '$q',
    '$resource',
    'gaService',
    'API_URI',
    'DEBUG'
  ];

  function contactService(
    $q,
    $resource,
    gaService,
    API_URI,
    DEBUG
  ) {
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
        if (
          contact.Id === undefined ||
          contact.Id === null
        ) {
          if (DEBUG) {
            console.log('CREATING contact record', contact);
          }
          gaService.addSalesforceRequest('Create Contact', ' New Contact');
          contact.$save(
            function(record) {
              if (record.success) {
                contact.Id = record.Id;
                if (DEBUG) {
                  console.log('contact Created', contact);
                }
                gaService.addSalesforceResponse(
                  'Create Contact',
                  record.Id
                );
                resolve(contact);
              } else {
                if (DEBUG) {
                  console.log('There was an error creating the contact');
                }
                gaService.addSalesforceError(
                  'Create Contact',
                  'New Contact',
                  'No error status'
                );
                reject('There was an error creating the contact');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create Contact',
                'New Contact',
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
            console.log('UPDATING contact record', contact);
          }
          gaService.addSalesforceRequest('Update Contact', contact.Id);
          contact.$update(
            {
              contactid: contact.Id
            },
            function(record) {
              if (record.success) {
                if (DEBUG) {
                  console.log('contact Updated', contact);
                }
                gaService.addSalesforceResponse(
                  'Update Contact',
                  record.Id
                );
                resolve(contact);
              } else {
                if (DEBUG) {
                  console.log('There was an error updating the contact');
                }
                gaService.addSalesforceError(
                  'Update Contact',
                  contact.Id,
                  'No error status'
                );
                reject('There was an error updating the contact');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Update Contact',
                contact.Id,
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
