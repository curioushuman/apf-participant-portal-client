/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('ngSetFocus', ngSetFocus);

  ngSetFocus.$inject = [
    '$timeout'
  ];

  function ngSetFocus($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var delay = 300;

        scope.$on(attrs.ngSetFocus, function(e) {
          console.log('Set focus to', attrs.ngSetFocus);
          $timeout(function() {
            var slider = element[0].getElementsByClassName('md-slider-wrapper');
            if (slider.length > 0) {
              var wrapper = angular.element(slider[0]);
              wrapper.focus();
            } else {
              element[0].focus();
            }
          }, delay);
        });
      }
    };
  }
})();
