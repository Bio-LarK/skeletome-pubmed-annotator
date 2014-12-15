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
        $scope.limit = 10;

        ////////////

        var termPromise;


        if ($stateParams.termType === 'hpo') {
            // /hpo?id=<<HPO ID>>
            termPromise = $http.get('http://118.138.241.167:8080/phenopub/hpo?id=' + $stateParams.termId)
            .then(function (response) {
                return response.data;
            });
        }
        if ($stateParams.termType === 'mesh') {
            termPromise = $http.get('http://118.138.241.167:8080/phenopub/mesh?id=' + $stateParams.termId)
            .then(function (response) {
                return response.data;
            });
        }

        

        $scope.loadMore = function () {
            $scope.limit = Math.min($scope.limit + 10, $scope.term.pubs.length);
            loadFullPubmeds($scope.term.pubs, $scope.limit);
        };

        function loadFullPubmeds(pubmeds, limit) {
            // Get the descriptions for the first 10 pubmeds
            // Now load in all the pubmed info
            // Get all the pmids for the first few
            var firstPubmeds = pubmeds.slice(0, limit);
            var pmids = _.reduce(firstPubmeds, function (pmids, pubmed) {
                if (!pubmed.abstract) {
                    pmids.push(pubmed.pmid);
                }
                return pmids;
            }, []);

            // console.log('all pubmeds', $scope.allPubmeds);
            if (pmids.length) {
                $http.get('http://118.138.241.167:8080/phenopub/search?pmid=' + pmids.join(','))
                .success(function (fullPubmeds) {
                    _.each(fullPubmeds, function (fullPubmed, key) {
                        var pubmed = _.findWhere(pubmeds, {
                            id: key
                        });
                        _.extend(pubmed, fullPubmed);
                    });
                });
            }
        }

        termPromise.then(function (term) {
            _.each(term.hpo, function (hpo, id) {
                hpo.id = id;
                hpo.ic = parseFloat(hpo.ic);
            });
            _.each(term.pubs, function (pubmed) {
                pubmed.id = pubmed.pmid;
                // hpo.ic = parseFloat(hpo.ic);
            });

            console.log('pubmeds', term.pubs);

            term.mesh = _.values(term.mesh);
            term.hpo = _.values(term.hpo);
            $scope.term = term;


            if(term.doid) {
                var url;
                angular.forEach(term.doid, function(doid, key) {
                    url = doid['vis_id'] || url;
                });
                $scope.diseaseNetworkUrl = url;
            }

            $scope.maxIc = _.reduce(term.hpo, function (maxIc, hpo) {
                return Math.max(maxIc, hpo.ic);
            }, 0);


            term.pubs = _.values(term.pubs);

            loadFullPubmeds(term.pubs, 10);
            
        });


    });