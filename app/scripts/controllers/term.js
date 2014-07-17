'use strict';

/**
 * @ngdoc function
 * @name skeletomePubmedAnnotatorApp.controller:TermCtrl
 * @description
 * # TermCtrl
 * Controller of the skeletomePubmedAnnotatorApp
 */
angular.module('skeletomePubmedAnnotatorApp')
    .controller('TermCtrl', function ($scope, $http, $stateParams) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        var termPromise;

        if ($stateParams.termType === 'hpo') {
            // /hpo?id=<<HPO ID>>
            termPromise = $http.get('phenopub/hpo?id=' + $stateParams.termId).then(function (response) {
                return response.data;
            });
        }
        if ($stateParams.termType === 'mesh') {
            termPromise = $http.get('phenopub/mesh?id=' + $stateParams.termId).then(function (response) {
                return response.data;
            });
        }

        termPromise.then(function (term) {
            term.mesh = _.values(term.mesh);
            term.hpo = _.values(term.hpo);
            $scope.term = term;

            term.pubs = _.values(term.pubs);
            var firstPubmeds = term.pubs.slice(0, 3);
            var pmids = _.reduce(firstPubmeds, function (pmids, pubmed) {
                if (!pubmed.abstract) {
                    pmids.push(pubmed.pmid);
                }
                return pmids;
            }, []);

            // console.log('all pubmeds', allPubmeds);
            if (pmids.length) {
                $http.get('phenopub/search?pmid=' + pmids.join(',')).success(function (fullPubmeds) {
                    _.each(fullPubmeds, function (fullPubmed, key) {
                        var pubmed = _.findWhere(term.pubs, {
                            id: key
                        });
                        console.log('extending', pubmed, 'with', fullPubmed);
                        _.extend(pubmed, fullPubmed);
                    });
                });
            }
        });


    });