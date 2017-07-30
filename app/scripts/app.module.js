/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app', [
      // Angular modules.
      'ngRoute',
      'ngMaterial',
      'ngResource',
      'ngMessages',

      // Custom modules.
      'app.core',
      'app.landing',
      'app.registration',
      'app.layout'
    ])
    .config(configFunction)
    .run(runFunction);

  configFunction.$inject = [
    '$locationProvider',
    '$routeProvider',
    '$mdThemingProvider'
  ];

  function configFunction(
    $locationProvider,
    $routeProvider,
    $mdThemingProvider
  ) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({
      redirectTo: '/'
    });
    $mdThemingProvider.theme('default')
      .primaryPalette('blue', {
        'default': '600',
        'hue-1': '700',
        'hue-2': '800',
        'hue-3': '900'
      })
      .accentPalette('pink', {
        'default': '600',
        'hue-1': '700',
        'hue-2': '800',
        'hue-3': '900'
      })
      .warnPalette('deep-orange', {
        'default': '600',
        'hue-1': '700',
        'hue-2': '800',
        'hue-3': '900'
      })
      .backgroundPalette('grey');
  }

  runFunction.$inject = ['$rootScope', '$location', 'layoutService'];

  function runFunction($rootScope, $location, layoutService) {

  }
})();
