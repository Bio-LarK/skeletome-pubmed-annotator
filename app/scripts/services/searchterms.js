'use strict';

/**
 * @ngdoc service
 * @name skeletomePubmedAnnotatorApp.searchterms
 * @description
 * # searchterms
 * Factory in the skeletomePubmedAnnotatorApp.
 */
angular.module('skeletomePubmedAnnotatorApp')
    .factory('searchterms', function () {
        // Service logic

        // Public API here
        return {
            terms: function () {
                return {};
            }
        };
    });