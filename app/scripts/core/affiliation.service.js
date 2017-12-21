/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint camelcase: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('affiliationService', affiliationService);

  affiliationService.$inject = [
    '$filter',
    '$q',
    '$resource',
    'gaService',
    'API_URI',
    'DEBUG'
  ];

  function affiliationService(
    $filter,
    $q,
    $resource,
    gaService,
    API_URI,
    DEBUG
  ) {
    var Affiliation = $resource(API_URI + '/aff',
      {},
      {
        get: {
          method: 'GET',
          url: API_URI + '/aff/:contactid/:accountid',
          params: {
            contactid: '@contactid',
            accountid: '@accountid'
          }
        },
        queryByContact: {
          method: 'GET',
          url: API_URI + '/aff/contact/:contactid?current=true',
          params: {
            contactid: '@contactid'
          },
          isArray: true
        },
        primary: {
          method: 'GET',
          url: API_URI + '/aff/primary/:contactid',
          params: {
            contactid: '@contactid'
          }
        },
        update: {
          method: 'PUT',
          url: API_URI + '/aff/:affiliationid',
          params: {
            affiliationid: '@affiliationid'
          }
        }
      }
    );

    var service = {
      Affiliation: Affiliation,
      retrieve: Affiliation.get,
      retrievePrimary: Affiliation.primary,
      listByContact: Affiliation.queryByContact,
      equalsOrganisation: equalsOrganisation,
      equalsOther: equalsOther,
      saveFoundAffiliation: saveFoundAffiliation,
      save: save
    };

    return service;

    function equalsOrganisation(affiliation1, affiliation2) {
      if (!affiliation1 || !affiliation2) {
        return false;
      }
      var equals = false;
      if (
        affiliation1.npe5__Organization__c ===
        affiliation2.npe5__Organization__c
      ) {
        equals = true;
      }
      return equals;
    }

    function equalsOther(affiliation1, affiliation2) {
      if (!affiliation1 || !affiliation2) {
        return false;
      }
      var equals = false;
      var startdate1 = affiliation1.npe5__StartDate__c;
      var startdate2 = affiliation2.npe5__StartDate__c;
      if (typeof (startdate1) !== 'object') {
        startdate1 = new Date(affiliation1.npe5__StartDate__c);
      }
      startdate1 = $filter('date')(startdate1, 'dd/MM/yyyy');
      if (typeof (startdate2) !== 'object') {
        startdate2 = new Date(affiliation2.npe5__StartDate__c);
      }
      startdate2 = $filter('date')(startdate2, 'dd/MM/yyyy');
      if (
        affiliation1.Department__c === affiliation2.Department__c &&
        affiliation1.npe5__Role__c === affiliation2.npe5__Role__c &&
        affiliation1.npe5__Description__c ===
          affiliation2.npe5__Description__c &&
        startdate1 === startdate2
      ) {
        equals = true;
      }
      return equals;
    }

    function saveFoundAffiliation(affiliation) {
      return {
        npe5__Organization__c: affiliation.npe5__Organization__c,
        Department__c: affiliation.Department__c,
        npe5__Role__c: affiliation.npe5__Role__c,
        npe5__StartDate__c: affiliation.npe5__StartDate__c
      };
    }

    function save(affiliation) {
      if (DEBUG) {
        console.log('Saving affiliation', affiliation);
      }
      return $q(function(resolve, reject) {
        if (
          affiliation.Id === undefined ||
          affiliation.Id === null
        ) {
          if (DEBUG) {
            console.log('CREATING affiliation record', affiliation);
          }
          gaService.addSalesforceRequest('Create', 'Affiliation');
          affiliation.$save(
            function(record) {
              gaService.addSalesforceResponse(
                'Create',
                'Affiliation'
              );
              if (record.success) {
                affiliation.Id = record.Id;
                if (DEBUG) {
                  console.log('affiliation Created', affiliation);
                  console.log('from record', record);
                }
                resolve(affiliation);
              } else {
                if (DEBUG) {
                  console.log('There was an error creating the affiliation');
                }
                reject('There was an error creating the affiliation');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create',
                'Affiliation',
                err.status
              );
              if (DEBUG) {
                console.log('There was an error creating the affiliation', err);
              }
              reject(err);
            }
          );
        } else {
          if (DEBUG) {
            console.log('UPDATING affiliation record', affiliation);
          }
          gaService.addSalesforceRequest('Update', 'Affiliation');
          affiliation.$update(
            {
              affiliationid: affiliation.Id
            },
            function(record) {
              gaService.addSalesforceResponse(
                'Update',
                'Affiliation'
              );
              if (record.success) {
                if (DEBUG) {
                  console.log('affiliation Updated', affiliation);
                }
                resolve(affiliation);
              } else {
                if (DEBUG) {
                  console.log('There was an error updating the affiliation');
                }
                reject('There was an error updating the affiliation');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Update',
                'Affiliation',
                err.status
              );
              if (DEBUG) {
                console.log('There was an error updating the affiliation', err);
              }
              reject(err);
            }
          );
        }
      });
    }
  }
})();
