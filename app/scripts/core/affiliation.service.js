/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('affiliationService', affiliationService);

  affiliationService.$inject = [
    '$resource',
    '$filter',
    'API_URI'
  ];

  function affiliationService($resource, $filter, API_URI) {

    var Affiliation = $resource(API_URI + '/affiliation',
      {},
      {
        'get': {
          method:'GET',
          url: API_URI + '/affiliation/:contactid/:accountid',
          params: { contactid: '@contactid', accountid: '@accountid' }
        },
        'primary': {
          method:'GET',
          url: API_URI + '/affiliation/primary/:contactid',
          params: { contactid: '@contactid' }
        },
        'update': {
          method:'PUT',
          url: API_URI + '/affiliation/:affiliationid',
          params: { affiliationid: '@affiliationid' }
        }
      }
    );

    var service = {
      Affiliation: Affiliation,
      retrieve: Affiliation.get,
      retrievePrimary: Affiliation.primary,
      isNhri: isNhri,
      equalsOrganisation: equalsOrganisation,
      equalsOther: equalsOther
    };

    return service;

    function isNhri(affiliation, nhris) {
      var fi = $filter('filter')(nhris, { Id: affiliation.npe5__Organization__c }).length;
      if (fi > 0) {
        return true;
      }
      return false;
    }

    function equalsOrganisation(affiliation1, affiliation2) {
      if (
        affiliation1.npe5__Organization__c === affiliation2.npe5__Organization__c
      ) {
        return true;
      } else {
        return false;
      }
    }

    function equalsOther(affiliation1, affiliation2) {
      var startdate1 = affiliation1.npe5__StartDate__c;
      var startdate2 = affiliation2.npe5__StartDate__c;
      if (typeof(startdate1) !== 'object') {
        startdate1 = new Date(affiliation1.npe5__StartDate__c);
      }
      startdate1 = $filter('date')(startdate1, "dd/MM/yyyy");
      if (typeof(startdate2) !== 'object') {
        startdate2 = new Date(affiliation2.npe5__StartDate__c);
      }
      startdate2 = $filter('date')(startdate2, "dd/MM/yyyy");
      if (
        affiliation1.Department__c === affiliation2.Department__c
        && affiliation1.npe5__Role__c === affiliation2.npe5__Role__c
        && startdate1 === startdate2
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
})();
