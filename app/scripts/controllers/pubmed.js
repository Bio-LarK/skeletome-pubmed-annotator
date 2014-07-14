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
        // _.each(pubmed, function(pubmed) {

        // })
        // $scope.pubmed = {
        //     id: 1,
        //     title: 'COL1A1 C-propeptide cleavage site mutation causes high bone mass, bone fragility and jaw lesions: a new cause of gnathodiaphyseal dysplasia?',
        //     abstract: 'BACKGROUND: Gnathodiaphyseal dysplasia (GDD) is a rare autosomal dominant condition characterised by bone fragility, irregular bone mineral density (BMD) and fibro-osseous lesions in the skull and jaw. Mutations in Anoctamin-5 (ANO5) have been identified in some cases. OBJECTIVE: We aimed to identify the causative mutation in a family with features of GDD but no mutation in ANO5, using whole exome capture and massive parallel sequencing (WES). RESULTS: WES of two affected individuals (a mother and son) and the mother\'s unaffected parents identified a mutation in the C-propeptide cleavage site of COL1A1. Similar mutations have been reported in individuals with osteogenesis imperfecta (OI) and paradoxically increased BMD. CONCLUSION: C-propeptide cleavage site mutations in COL1A1 may not only cause \'high bone mass OI\', but also the clinical features of GDD, specifically irregular sclerotic BMD and fibro-osseous lesions in the skull and jaw. GDD patients negative for ANO5 mutations should be assessed for mutations in type I Collagen C-propeptide cleavage sites.'
        // };

    });