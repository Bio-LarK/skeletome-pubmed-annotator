'use strict';

/**
 * @ngdoc service
 * @name skeletomePubmedAnnotatorApp.searchbar
 * @description
 * # searchbar
 * Factory in the skeletomePubmedAnnotatorApp.
 */
angular.module('skeletomePubmedAnnotatorApp')
    .factory('searchbar', function ($rootScope, $timeout) {
        // Service logic
        // ...
        // 
        var searchbar = {
            terms: []
        };

        $rootScope.$on('$stateChangeStart', function (event, toState) {
            console.log('toState', toState);
            if (toState.name !== 'results') {
                searchbar.terms.length = 0;
            }

            if (toState.name === 'results') {
                console.log('focus!');
                $timeout(function () {
                    $('#global-search').select2('focus', true);
                });
            }
        });

        // Public API here
        return searchbar;
    });