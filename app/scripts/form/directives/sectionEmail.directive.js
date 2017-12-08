/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.form')
    .directive('gzSectionEmail', gzSectionEmail);

  gzSectionEmail.$inject = [
    'layoutService'
  ];

  function gzSectionEmail(layoutService) {
    return {
      require: '^^gzSection',
      templateUrl:
        'scripts/form/directives/sectionEmail.template.html',
      restrict: 'E',
      scope: {

      },
      link: function(scope, elem, attrs, sectionCtrl) {
        var section = {
          id: 'email',
          title: 'Balls woot',
          complete: false
        };
        sectionCtrl.section = section;
      }
    };
  }
})();
