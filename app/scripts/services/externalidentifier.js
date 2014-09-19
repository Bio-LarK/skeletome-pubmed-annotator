'use strict';

/**
 * @ngdoc service
 * @name skeletomePubmedAnnotatorApp.externalidentifier
 * @description
 * # externalidentifier
 * Factory in the skeletomePubmedAnnotatorApp.
 */
angular.module('skeletomePubmedAnnotatorApp')
  .factory('externalidentifier', function () {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      }
    };
  });
