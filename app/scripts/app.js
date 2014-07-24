'use strict';

/**
 * @ngdoc overview
 * @name skeletomePubmedAnnotatorApp
 * @description
 * # skeletomePubmedAnnotatorApp
 *
 * Main module of the application.
 */
angular.module('skeletomePubmedAnnotatorApp', [
    'ui.router', 'restangular', 'ui.select2', 'angular-loading-bar',
    'truncate'
])
    .run(function ($rootScope, $state, $stateParams, searchbar, $timeout, $http) { // instance-injector
        // This is an example of a run block.
        // You can have as many of these as you want.
        // You can only inject instances (not Providers)
        // into run blocks



        $rootScope.searchSelect = {
            placeholder: 'Search for HPO, Mesh, Title, Author',
            // dropdownAutoWidth: true,
            width: 'resolve',
            multiple: true,
            minimumInputLength: 2,
            query: function (options) {
                console.log('options', options);

                // encodeURIComponent(options.term).replace(/%20/g, "+");
                $http.get('http://118.138.241.167:8080/phenopub/autocomplete?start=' + encodeURIComponent(options.term).replace(/%20/g, '+')).success(function (data) {
                    var meshes = _.map(data.MESH, function (mesh) {
                        mesh.type = 'mesh';
                        mesh.text = mesh.label + ' (MeSH)';
                        return mesh;
                    });
                    var hpos = _.map(data.HPO, function (hpo) {
                        hpo.type = 'hpo';
                        hpo.text = hpo.label + ' (HPO)';
                        return hpo;
                    });
                    var pubmeds = _.map(data.PUBMED, function (pubmed) {
                        pubmed.type = 'pubmed';
                        pubmed.text = pubmed.label + ' (Publication)';
                        return pubmed;
                    });

                    var results = meshes.concat(hpos).concat(pubmeds);
                    // console.log('meshes', results);
                    options.callback({
                        results: _.sortBy(results, function (result) {
                            return result.text.length;
                        })
                    });
                });
            }
        };

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.searchbar = searchbar;

    })
    .config(function ($stateProvider, $urlRouterProvider) {
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
                url: '/results?terms',
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
    });