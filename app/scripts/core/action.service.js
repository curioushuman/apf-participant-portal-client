/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('actionService', actionService);

  actionService.$inject = [
    '$resource',
    'API_URI'
  ];

  function actionService($resource, API_URI) {

    var Action = $resource(API_URI + '/action/:slug',
      { slug: '@slug' }
    );

    var service = {
      list: Action.query,
      retrieve: Action.get
    };

    return service;
  }
})();
