/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('actionService', actionService);

  actionService.$inject = ['$resource'];

  function actionService($resource) {

    var Action = $resource('http://localhost:8000/salesforce/action/:slug',
      { slug: '@slug' }
    );

    var service = {
      list: Action.query,
      retrieve: Action.get
    };

    return service;
  }
})();