/* eslint no-unused-vars: 0 */
/* eslint quotes: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .factory('layoutService', layoutService);

  layoutService.$inject = [
    '$location',
    '$filter',
    '$anchorScroll'
  ];

  function layoutService(
    $location,
    $filter,
    $anchorScroll
  ) {
    var debug = false;

    // note: this doesn't work
    $anchorScroll.yOffset = 30;

    var service = {
      navigate: navigate,
      formatDate: formatDate,
      listFromString: listFromString
    };

    return service;

    function navigate(view, hash) {
      // still needs some work on resume and begin
      if (view) {
        $location.path('/' + view);
      }
      if (hash) {
        if (debug) {
          console.log('navigate', hash);
        }
        $anchorScroll(hash);
      }
    }

    function formatDate(dateString) {
      return $filter('date')(dateString, 'd MMMM yyyy');
    }

    function listFromString(str) {
      return str.split("\n");
    }
  }
})();
