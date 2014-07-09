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
        $scope.pubmedId = 17935554;
        $scope.selectedText = '';

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

        $scope.addAnnotation = function () {
            $scope.annotations.unshift($scope.annotation);
            $scope.annotation = {};
        };
        $scope.removeAnnotation = function (annotation) {
            $scope.annotations = _.without($scope.annotations, annotation);
        };


        $scope.hpoSelect = {
            dropdownAutoWidth: true,
            multiple: false,
            width: 'element',
            // minimumInputLength: 2,
            query: function (options) {
                console.log('options', options);
                // http://skelarch.skeletome.org/drupal/api/gene?parameters%5Bname%5D=fgfr
                Restangular.all('hpos').getList({
                    'name': encodeURIComponent(options.term)
                }).then(function (hpos) {
                    var data = {
                        results: []
                    };
                    angular.forEach(hpos, function (hpo) {
                        // Convert clinical feature to tag
                        hpo.text = hpo.name;
                        data.results.push(hpo);
                    });
                    options.callback(data);
                });
            }
        };


        // $scope.$watch(function () {
        //     return ;
        // }, function (range) {
        //     $scope.selectedText = $scope.abstract.substring(range.startOffset, range.endOffset);
        // });
        // get the range
        // window.getSelection().getRangeAt(0)

        // $scope.save = function(annotations) {
        // send the annotations somewhere

        // };

    });