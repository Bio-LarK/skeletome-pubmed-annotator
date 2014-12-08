'use strict';

/**
 * @ngdoc directive
 * @name skeletomePubmedAnnotatorApp.directive:annotator
 * @description
 * # annotator
 */
angular.module('skeletomePubmedAnnotatorApp')
    .directive('annotator', function () {
        return {
            // templateUrl: 'views/annotator.html',
            restrict: 'A',
            link: function postLink(scope, element) {
                // element.text('this is the annotator directive');

                // console.log('text', element.html());

                element.annotator();

                // var formattedText;
                // scope.isAnnotating = false;

                // scope.$watch('text', function () {
                //     markupText(scope.text, scope.annotations);
                // });

                // scope.$watch('annotations', function (newAnnotations, oldAnnotations) {
                //     console.log('annotations changed', newAnnotations);
                //     if (!oldAnnotations && newAnnotations) {
                //         markupText(scope.text, scope.annotations);
                //     }
                // });

                // scope.mouseDown = function () {
                //     console.log('down');
                //     scope.isAnnotating = true;
                //     // element.find('.abstract').text(scope.text);
                // };
                // scope.mouseUp = function () {
                //     console.log('up');

                //     var range = window.getSelection().getRangeAt(0);
                //     scope.annotation = {
                //         startOffset: range.startOffset,
                //         endOffset: range.endOffset,
                //         originalSpan: scope.text.substring(range.startOffset, range.endOffset)
                //     };
                //     // element.find('.abstract').html(formattedText);
                //     // markupText
                //     // 
                //     scope.isAnnotating = false;

                // };

                // // scope.mouseUp = function () {

                // // };

                // function compileText() {
                //     var $abstract = element.find('.abstract');
                //     $abstract.html(formattedText);
                //     $compile($abstract)(scope);
                // }

                // function markupText(text, annotations) {
                //     formattedText = text;

                //     angular.forEach(annotations, function (annotation, index) {
                //         var re = new RegExp('\\b(' + annotation.originalSpan + ')\\b', 'gi');
                //         formattedText = formattedText.replace(re, '<annotation data="annotations[' + index + ']"></annotation>');
                //     });

                //     compileText();
                // }

            }
        };
    });