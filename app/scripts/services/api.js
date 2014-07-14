'use strict';

/**
 * @ngdoc service
 * @name skeletomePubmedAnnotatorApp.api
 * @description
 * # api
 * Factory in the skeletomePubmedAnnotatorApp.
 */
angular.module('skeletomePubmedAnnotatorApp')
    .factory('api', function () {
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