'use strict';

/**
 * @ngdoc function
 * @name skeletomePubmedAnnotatorApp.controller:PubmedCtrl
 * @description
 * # PubmedCtrl
 * Controller of the skeletomePubmedAnnotatorApp
 */
angular.module('skeletomePubmedAnnotatorApp')
    .controller('PubmedCtrl', function ($scope, $http, $stateParams) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        $http.get('phenopub/pmid?id=' + $stateParams.pubmedId).then(function (response) {
            // Transform the data into standard format
            var pubmed = response.data;
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