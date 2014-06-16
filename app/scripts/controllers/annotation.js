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

        $scope.getPubmed = function (pubmedId) {
            Restangular.one('pubmed', pubmedId).get().then(function (pubmed) {
                $scope.pubmed = pubmed;
            });
        };

    });