/* eslint no-unused-vars: 0 */
/* eslint require-jsdoc: 0 */
/* eslint quotes: 0 */
/* global angular */
(function() {
  'use strict';

  angular
    .module('<%= moduleName %>')<% _.forEach(constants, function (constant) { %>
    .<%= type %>('<%= constant.name %>', <%= constant.value %>)<% }); %>;
})();
