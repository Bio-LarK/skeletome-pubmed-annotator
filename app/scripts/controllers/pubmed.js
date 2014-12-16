'use strict';

/**
 * @ngdoc function
 * @name skeletomePubmedAnnotatorApp.controller:PubmedCtrl
 * @description
 * # PubmedCtrl
 * Controller of the skeletomePubmedAnnotatorApp
 */
angular.module('skeletomePubmedAnnotatorApp')
    .controller('PubmedCtrl', function ($scope, $http, $stateParams, pageService) {

        console.log('HERE!');

        $http.get('http://118.138.241.167:8080/phenopub/pmid?id=' + $stateParams.pubmedId).then(function (response) {
            // Transform the data into standard format
            var pubmed = response.data;
            pageService.title = pubmed.title;
            
            _.each(pubmed.hpo, function (hpo, id) {
                hpo.id = id;
                hpo.ic = parseFloat(hpo.ic);
            });
            pubmed.hpo = _.values(pubmed.hpo);
            pubmed.mesh = _.values(pubmed.mesh);
            $scope.pubmed = pubmed;

            // Calculate the maximum IC
            $scope.maxIc = _.reduce(pubmed.hpo, function (maxIc, hpo) {
                return Math.max(maxIc, hpo.ic);
            }, 0);

            $scope.pubmed = pubmed;

        });

    });