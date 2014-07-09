'use strict';

/**
 * @ngdoc function
 * @name skeletomePubmedAnnotatorApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the skeletomePubmedAnnotatorApp
 */
angular.module('skeletomePubmedAnnotatorApp')
    .controller('SearchCtrl', function ($scope, $state) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        $scope.results = [{
            id: 1,
            type: 'hpo',
            text: 'Macrocephaly'
        }, {
            id: 2,
            type: 'hpo',
            text: 'Frontal Bossing'
        }, {
            id: 3,
            type: 'hpo',
            text: 'Short Stature'
        }];

        $scope.search = [];

        $scope.searchChanged = function (terms) {
            if (terms && terms.length) {
                console.log('temrs are', terms);
                // $state.go('results');
            }
        };

        $scope.searchSelect = {
            placeholder: 'Search for HPO, Mesh, Title, Author',
            dropdownAutoWidth: true,
            width: 'element',
            multiple: true,
            minimumInputLength: 2,
            query: function (options) {
                var data = {
                    results: $scope.results
                };

                options.callback(data);
            }
        };
    });


//