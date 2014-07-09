'use strict';

/**
 * @ngdoc directive
 * @name skeletomePubmedAnnotatorApp.directive:annotation
 * @description
 * # annotation
 */
angular.module('skeletomePubmedAnnotatorApp')
    .directive('annotation', function () {
        return {
            templateUrl: 'views/dir.annotation.html',
            restrict: 'E',
            scope: {
                data: '='
            },
            link: function postLink(scope) {
                scope.$watch('data', function (data) {
                    console.log(data);
                });

                scope.mouseEnter = function () {
                    scope.isOver = true;
                };
                scope.mouseLeave = function () {
                    scope.isOver = false;
                };

                // element.text('this is the annotation directive');
            }
        };
    });