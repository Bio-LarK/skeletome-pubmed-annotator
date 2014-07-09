'use strict';

/**
 * @ngdoc overview
 * @name skeletomePubmedAnnotatorApp
 * @description
 * # skeletomePubmedAnnotatorApp
 *
 * Main module of the application.
 */
angular.module('skeletomePubmedAnnotatorApp', ['ui.router', 'restangular', 'ui.select2'])
    .run(function ($rootScope, $state, $stateParams, searchbar, $timeout) { // instance-injector
        // This is an example of a run block.
        // You can have as many of these as you want.
        // You can only inject instances (not Providers)
        // into run blocks
        $rootScope.hpos = [{
            id: 1,
            type: 'hpo',
            text: 'Macrocephaly'
        }, {
            id: 2,
            type: 'hpo',
            text: 'Frontal Bossing'
        }, {
            id: 3,
            type: 'hpo',
            text: 'Short Stature'
        }];

        $rootScope.doSearch = function (terms) {
            if (terms && terms.length) {
                $state.go('results');
            }
        };


        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                console.log('toState', toState);
                if (toState.name !== 'results') {
                    searchbar.terms.length = 0;

                } else {
                    console.log('focus!');
                    $timeout(function () {
                        console.log('focus bnow!!');
                        $('#global-search').select2('focus', true);
                    });
                }
                // event.preventDefault();
                // transitionTo() promise will be rejected with 
                // a 'transition prevented' error
            });


        $rootScope.searchSelect = {
            placeholder: 'Search for HPO, Mesh, Title, Author',
            dropdownAutoWidth: true,
            width: 'element',
            multiple: true,
            minimumInputLength: 2,
            query: function (options) {
                var data = {
                    results: $rootScope.hpos
                };

                options.callback(data);
            }
        };

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.searchbar = searchbar;

    })
    .config(function ($stateProvider, $urlRouterProvider, RestangularProvider) {
        console.log('ho there');
        RestangularProvider.setBaseUrl('api');

        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise('/');
        //
        // Now set up the states
        $stateProvider
            .state('search', {
                url: '/',
                controller: 'SearchCtrl',
                templateUrl: 'views/search.html'
            })
            .state('results', {
                url: '/results',
                controller: 'ResultsCtrl',
                templateUrl: 'views/results.html'
            })
            .state('term', {
                url: '/term/:termId/:termType/:termName',
                controller: 'TermCtrl',
                templateUrl: 'views/term.html'
            })
            .state('pubmed', {
                url: '/pubmed/:pubmedId',
                controller: 'PubmedCtrl',
                templateUrl: 'views/pubmed.html'
            });

        console.log('why dont my states work');
    });