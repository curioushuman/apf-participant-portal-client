/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
/* global firebase */
(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('questionService', questionService);

  questionService.$inject = [
    '$resource',
    'API_URI'
  ];

  function questionService($resource, API_URI) {

    var Question = $resource(API_URI + '/question/:actionid',
      { actionid: '@actionid' }
    );

    var service = {
      list: Question.query,
      retrieve: Question.get
    };

    return service;
  }
})();
