/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint quotes: 0 */
/* eslint camelcase: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('app.participation')
    .controller('FaceToFaceController', FaceToFaceController);

  FaceToFaceController.$inject = [
    '$q',
    '$filter',
    '$mdDateLocale',
    '$scope',
    'actionService',
    'gaService',
    'layoutService',
    'participantService',
    'DEBUG',
    'API_URI'
  ];

  function FaceToFaceController(
    $q,
    $filter,
    $mdDateLocale,
    $scope,
    actionService,
    gaService,
    layoutService,
    participantService,
    DEBUG,
    API_URI
  ) {
    var vm = this;

    // debugging / developing
    if (DEBUG) {
      console.log('DEBUG is ON');
      console.log('API URI', API_URI);
    }

    vm.navigate = layoutService.navigate;

    // pubnlic link
    // https://ap4.salesforce.com/
    // sfc/p/6F000000EYnk/a/
    // 6F0000000sAH/
    // uDLB7mE52HExYkMV2UAxpi_Mk_55chaGXlJlGeYFLXI
    // OR
    // https://c.na15.content.force.com/
    // sfc/servlet.shepherd/version/download/
    // 068i0000001hwPn
    // ?asPdf=false&operationContext=CHATTER
    // https://c.na15.content.force.com/sfc/servlet.shepherd/version/download/0686F00000551TdQAI?asPdf=false&operationContext=CHATTER
  }
})();
