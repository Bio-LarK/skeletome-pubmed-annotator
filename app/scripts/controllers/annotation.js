'use strict';

/**
 * @ngdoc function
 * @name skeletomePubmedAnnotatorApp.controller:AnnotationCtrl
 * @description
 * # AnnotationCtrl
 * Controller of the skeletomePubmedAnnotatorApp
 */
angular.module('skeletomePubmedAnnotatorApp')
    .controller('AnnotationCtrl', function ($scope, Restangular) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];
        $scope.pubmedId = 24891183;

        $scope.getPubmed = function (pubmedId) {
            Restangular.one('pubmed', pubmedId).get().then(function (pubmed) {
                $scope.pubmed = pubmed;
                var abstractTextArray = pubmed.PubmedArticle.MedlineCitation.Article.Abstract.AbstractText;
                $scope.abstract = _.reduce(abstractTextArray, function (abstract, text) {
                    return abstract + text;
                }, '');

                // Get all annotations
                console.log('pubmed', pubmed);

                pubmed.all('annotations').getList({}).then(function (annotations) {
                    $scope.annotations = annotations;
                });
            });
        };

    });