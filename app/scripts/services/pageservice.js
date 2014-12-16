'use strict';

/**
 * @ngdoc service
 * @name skeletomePubmedAnnotatorApp.pageService
 * @description
 * # pageService
 * Factory in the skeletomePubmedAnnotatorApp.
 */
angular.module('skeletomePubmedAnnotatorApp')
    .factory('pageService', function () {
        var title = '';

        var pageService = {};
        pageService.title = '';

        Object.defineProperty(pageService, 'title', {
            get: function() { 
                var pageTitle = title;
                if(title.length) {
                    pageTitle += ' - ';
                }
                return pageTitle + ' Pubmed Browser - Human Phenotype Ontology'; },
            set: function(newValue) { 
                title = newValue; 
            }
        });

        return pageService;
    });
