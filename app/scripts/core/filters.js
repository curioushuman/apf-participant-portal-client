/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint quotes: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.core')
    .filter('trust', ['$sce', function($sce) {
      return function(htmlCode){
        return $sce.trustAsHtml(htmlCode);
      }
    }]);
})();
