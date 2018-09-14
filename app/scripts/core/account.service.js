/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('accountService', accountService);

  accountService.$inject = [
    '$filter',
    '$q',
    '$resource',
    'gaService',
    'API_URI',
    'DEBUG'
  ];

  function accountService(
    $filter,
    $q,
    $resource,
    gaService,
    API_URI,
    DEBUG
  ) {
    var Account = $resource(API_URI + '/account',
      {},
      {
        get: {
          method: 'GET',
          url: API_URI + '/account/:accountid',
          params: {
            accountid: '@accountid'
          }
        },
        getMultiple: {
          method: 'GET',
          url: API_URI + '/account/multiple/:accountids',
          params: {
            accountids: '@accountids'
          },
          isArray: true
        },
        queryType: {
          method: 'GET',
          url: API_URI + '/account/type/:type',
          params: {
            type: '@type'
          },
          isArray: true
        },
        queryTypeExclude: {
          method: 'GET',
          url: API_URI + '/account/type/:type?exclude=true',
          params: {
            type: '@type'
          },
          isArray: true
        },
        update: {
          method: 'PUT',
          url: API_URI + '/account/:accountid',
          params: {
            accountid: '@accountid'
          }
        }
      }
    );

    var service = {
      Account: Account,
      list: Account.query,
      listByType: Account.queryType,
      listByOtherTypes: Account.queryTypeExclude,
      retrieve: Account.get,
      retrieveMultiple: Account.getMultiple,
      findAccountInAccounts: findAccountInAccounts,
      save: save
    };

    return service;

    function findAccountInAccounts(account, accounts) {
      var matching = $filter('filter')(
        accounts,
        account
      );
      if (matching.length > 0) {
        return matching[0];
      }
      return null;
    }

    function save(account) {
      if (DEBUG) {
        console.log('Saving account', account);
      }
      return $q(function(resolve, reject) {
        if (
          account.Id === undefined ||
          account.Id === null
        ) {
          if (DEBUG) {
            console.log('CREATING account record', account);
          }
          gaService.addSalesforceRequest('Create Account', 'New Account');
          account.$save(
            function(record) {
              if (record.success) {
                account.Id = record.Id;
                if (DEBUG) {
                  console.log('account Created', account);
                }
                gaService.addSalesforceResponse(
                  'Create Account',
                  record.Id
                );
                resolve(account);
              } else {
                if (DEBUG) {
                  console.log('There was an error creating the account');
                }
                gaService.addSalesforceError(
                  'Create Account',
                  'New Account',
                  'No error status'
                );
                reject('There was an error creating the account');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Create Account',
                'Account',
                err.status
              );
              if (DEBUG) {
                console.log('There was an error creating the account', err);
              }
              reject(err);
            }
          );
        } else {
          if (DEBUG) {
            console.log('UPDATING account record', account);
          }
          gaService.addSalesforceRequest('Update Account', account.Id);
          account.$update(
            {
              accountid: account.Id
            },
            function(record) {
              if (record.success) {
                if (DEBUG) {
                  console.log('account Updated', account);
                }
                gaService.addSalesforceResponse(
                  'Update Account',
                  record.Id
                );
                resolve(account);
              } else {
                if (DEBUG) {
                  console.log('There was an error updating the account');
                }
                gaService.addSalesforceError(
                  'Update Account',
                  account.Id,
                  'No error status'
                );
                reject('There was an error updating the account');
              }
            },
            function(err) {
              gaService.addSalesforceError(
                'Update Account',
                account.Id,
                err.status
              );
              if (DEBUG) {
                console.log('There was an error updating the account', err);
              }
              reject(err);
            }
          );
        }
      });
    }
  }
})();
