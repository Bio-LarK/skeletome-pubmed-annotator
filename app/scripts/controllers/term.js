'use strict';

/**
 * @ngdoc function
 * @name skeletomePubmedAnnotatorApp.controller:TermCtrl
 * @description
 * # TermCtrl
 * Controller of the skeletomePubmedAnnotatorApp
 */
angular.module('skeletomePubmedAnnotatorApp')
    .controller('TermCtrl', function ($scope, term) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        term.mesh = _.values(term.mesh);
        term.hpo = _.values(term.hpo);
        $scope.term = term;

    });