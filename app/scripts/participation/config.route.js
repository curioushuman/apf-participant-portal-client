/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.participation')
    .config(configFunction);

  configFunction.$inject = ['$routeProvider'];

  function configFunction($routeProvider) {
    $routeProvider.when('/participation', {
      templateUrl: 'scripts/participation/participation.view.html',
      controller: 'ParticipationController',
      controllerAs: 'vm'
    })
    .when('/participation/face_to_face', {
      templateUrl: 'scripts/participation/face_to_face/face_to_face.view.html',
      controller: 'FaceToFaceController',
      controllerAs: 'vm'
    });
  }
})();
