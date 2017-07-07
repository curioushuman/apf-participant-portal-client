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

      // Custom modules.
      'app.core',
      'app.landing',
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
        'default': 'A700',
        'hue-1': 'A400',
        'hue-2': 'A200',
        'hue-3': 'A100'
      })
      // Fitz recommend
      // .accentPalette('yellow', {
      //   'default': 'A700',
      //   'hue-1': 'A400',
      //   'hue-2': 'A200',
      //   'hue-3': 'A100'
      // })
      // .warnPalette('green', {
      //   'default': 'A700',
      //   'hue-1': 'A400',
      //   'hue-2': 'A200',
      //   'hue-3': 'A100'
      // })
      // simply flipping didn't work
      // i've changed green to be accent and added orange as warn
      .accentPalette('green', {
        'default': 'A700',
        'hue-1': 'A400',
        'hue-2': 'A200',
        'hue-3': 'A100'
      })
      .warnPalette('orange', {
        'default': 'A700',
        'hue-1': 'A400',
        'hue-2': 'A200',
        'hue-3': 'A100'
      })
      .backgroundPalette('grey');
  }

  runFunction.$inject = ['$rootScope', '$location', 'layoutService'];

  function runFunction($rootScope, $location, layoutService) {
    $rootScope.$on('$routeChangeError', function(event, next, previous, error) {
      if (error === 'AUTH_REQUIRED') {
        $location.path('/');
      }
    });
    $rootScope.$on('$routeChangeSuccess', function(event, next, previous, error) {

    });
  }
})();
