'use strict';

/**
 * @ngdoc service
 * @name skeletomePubmedAnnotatorApp.searchbar
 * @description
 * # searchbar
 * Factory in the skeletomePubmedAnnotatorApp.
 */
angular.module('skeletomePubmedAnnotatorApp')
    .factory('searchbar', function ($rootScope, $timeout, $state) {
        // Service logic
        // ...
        // 
        var searchbar = {
            terms: [],
            groupedTerms: {
                mesh: [],
                hpo: []
            }
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

        /**
         * Called when the search terms change
         * @param  {[type]} terms [description]
         * @return {[type]}       [description]
         */
        $rootScope.doSearch = function (terms) {
            if (terms) {
                searchbar.groupedTerms.hpo = _.where(terms, {
                    type: 'hpo'
                });
                searchbar.groupedTerms.mesh = _.where(terms, {
                    type: 'mesh'
                });
            }
            if (terms) {
                // console.log('no TEST!');
                if (terms.length === 0) {
                    // console.log('no length');
                    $state.go('search');
                    return;
                }
                var publication = _.findWhere(terms, {
                    type: 'pubmed'
                });

                if (publication) {
                    $state.go('pubmed', {
                        pubmedId: publication.id
                    });
                    return;
                }
                $state.go('results', {
                    terms: angular.toJson(terms)
                });
            }
        };




        // Public API here
        return searchbar;
    });