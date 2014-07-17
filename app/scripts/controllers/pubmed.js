'use strict';

/**
 * @ngdoc function
 * @name skeletomePubmedAnnotatorApp.controller:PubmedCtrl
 * @description
 * # PubmedCtrl
 * Controller of the skeletomePubmedAnnotatorApp
 */
angular.module('skeletomePubmedAnnotatorApp')
    .controller('PubmedCtrl', function ($scope, pubmed) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        // Transform the data into standard format
        _.each(pubmed.hpo, function (hpo, id) {
            hpo.id = id;
        });
        pubmed.hpo = _.values(pubmed.hpo);
        pubmed.mesh = _.values(pubmed.mesh);
        $scope.pubmed = pubmed;

        // Calculate the maximum IC
        $scope.maxIc = _.reduce(pubmed.hpo, function (maxIc, hpo) {
            return Math.max(maxIc, hpo.ic);
        }, 0);

    });