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

                // encodeURIComponent(options.term).replace(/%20/g, "+");
                $http.get('http://118.138.241.167:8080/phenopub/autocomplete?start=' + encodeURIComponent(options.term.trim()).replace(/%20/g, '+')).success(function (data) {
                    var meshes = _.map(data.MESH, function (mesh) {
                        mesh.type = 'mesh';
                        mesh.text = mesh.label; // + ' (MeSH)';
                        return mesh;
                    });
                    var hpos = _.map(data.HPO, function (hpo) {
                        hpo.type = 'hpo';
                        hpo.text = hpo.label; // + ' (HPO)';
                        return hpo;
                    });
                    var pubmeds = _.map(data.PUBMED, function (pubmed) {
                        pubmed.type = 'pubmed';
                        pubmed.text = pubmed.label; // + ' (Publication)';
                        return pubmed;
                    });


                    var results = [];

                    if (hpos.length) {
                        results.push({
                            text: 'HPO',
                            children: _.sortBy(hpos, function (hpo) {
                                return hpo.label.length;
                            })
                        });
                    }
                    if (meshes.length) {
                        results.push({
                            text: 'MeSH',
                            children: _.sortBy(meshes, function (mesh) {
                                return mesh.label.length;
                            })
                        });
                    }
                    if (pubmeds.length) {
                        results.push({
                            text: 'Publications',
                            children: _.sortBy(pubmeds, function (pubmed) {
                                return pubmed.label.length;
                            })
                        });
                    }

                    // var results = meshes.concat(hpos).concat(pubmeds);
                    // console.log('meshes', results);
                    options.callback({
                        results: results
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
            .state('about', {
                url: '/about',
                templateUrl: 'views/about.html'
            })
            .state('results', {
                url: '/results?terms',
                controller: 'ResultsCtrl',
                templateUrl: 'views/results.html'
            })
            .state('term', {
                url: '/:termType/:termId',
                resolve: {
                    termTypeCheck: ['$stateParams', '$q',
                        function ($stateParams, $q) {
                            if ($stateParams.termType !== 'mesh' && $stateParams.termType !== 'hpo' && $stateParams.termType !== 'doid') {
                                return $q.reject('Not a valid term type - ' + $stateParams.termType);
                            }
                        }
                    ]
                },
                controller: 'TermCtrl',
                templateUrl: 'views/term.html',
            })
            .state('pubmed', {
                url: '/pubmed/:pubmedId',
                controller: 'PubmedCtrl',
                templateUrl: 'views/pubmed.html'
            });
    });