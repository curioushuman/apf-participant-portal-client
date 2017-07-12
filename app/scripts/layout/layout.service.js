/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.layout')
    .factory('layoutService', layoutService);

  layoutService.$inject = [
    '$location',
    '$anchorScroll'
  ];

  function layoutService(
    $location,
    $anchorScroll
  ) {

    var service = {
      navigate: navigate,
      formatDate: formatDate
    };

    return service;

    function navigate(view, hash) {
      // still needs some work on resume and begin
      console.log(view);
      if (view) {
        console.log('change view');
        $location.path('/' + view);
      }
      if (hash) {
        console.log('change hash');
        $location.hash(hash);
        $anchorScroll();
      }
    }

    function formatDate(dateString) {
      var DateFromString = new Date(dateString);
      var formattedDate =
        DateFromString.getDate() +
        ' ' + months[DateFromString.getMonth()] +
        ' ' + DateFromString.getFullYear();
      return(formattedDate);
    }
  }
})();
