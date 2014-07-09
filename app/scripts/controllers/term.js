'use strict';

/**
 * @ngdoc function
 * @name skeletomePubmedAnnotatorApp.controller:TermCtrl
 * @description
 * # TermCtrl
 * Controller of the skeletomePubmedAnnotatorApp
 */
angular.module('skeletomePubmedAnnotatorApp')
    .controller('TermCtrl', function ($scope) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        $scope.term = {
            id: 2,
            type: 'hpo',
            text: 'Frontal Bossing'
        };

        $scope.pubmeds = [{
            id: 1,
            title: 'COL1A1 C-propeptide cleavage site mutation causes high bone mass, bone fragility and jaw lesions: a new cause of gnathodiaphyseal dysplasia?',
            abstract: 'BACKGROUND: Gnathodiaphyseal dysplasia (GDD) is a rare autosomal dominant condition characterised by bone fragility, irregular bone mineral density (BMD) and fibro-osseous lesions in the skull and jaw. Mutations in Anoctamin-5 (ANO5) have been identified in some cases. OBJECTIVE: We aimed to identify the causative mutation in a family with features of GDD but no mutation in ANO5, using whole exome capture and massive parallel sequencing (WES). RESULTS: WES of two affected individuals (a mother and son) and the mother\'s unaffected parents identified a mutation in the C-propeptide cleavage site of COL1A1. Similar mutations have been reported in individuals with osteogenesis imperfecta (OI) and paradoxically increased BMD. CONCLUSION: C-propeptide cleavage site mutations in COL1A1 may not only cause \'high bone mass OI\', but also the clinical features of GDD, specifically irregular sclerotic BMD and fibro-osseous lesions in the skull and jaw. GDD patients negative for ANO5 mutations should be assessed for mutations in type I Collagen C-propeptide cleavage sites.'
        }, {
            id: 2,
            title: 'A novel RNA-splicing mutation in COL1A1 gene causing osteogenesis imperfecta type I in a Chinese family.',
            abstract: 'Osteogenesis imperfecta (OI), also known as brittle bone disease, is a rare heterogeneous group of inherited disorders characterized by low bone mass and increased bone fragility. The four major clinical criteria for diagnosis of OI are osteoporosis with abnormal fragility of the skeleton, blue sclera, dentinogenesis imperfecta, and premature otosclerosis. The presence of two of these abnormalities confirms the diagnosis. More than 90% patients have autosomal dominant mutations in one of the two genes, COL1A1 and COL1A2, that encode the alpha chains of type I collagen. While the diagnosis of OI is still based on clinical and radiological grounds, there is a growing demand for the molecular characterization of causative mutations. Although there have been several studies on the mutational spectra of COL1A1 and/or COL1A2 in Western populations, very few cases have been reported from Asia. The purpose of this study is to report two patients with OI type I in a Chinese family, who had a novel RNA-splicing mutation in COL1A1 gene and describe the molecular, radiological and clinical findings. METHODS: The proband, (case II-5), a 32-y-old Chinese male, and his 7-y-old daughter were diagnosed as OI type I according to their clinical and radiological features. Genomic DNA was extracted from their blood samples and all promoters, exons and exon/intron boundaries of COL1A1 and COL1A2 genes were sequenced. Polymerase chain reaction sequence-specific primers (PCR-SSP) was used to confirm patients\' heterozygous state. RESULTS: Direct DNA sequencing analysis of COL1A1 gene revealed a splicing mutation (c.1875+1G>A, also as IVS 27+1G>A) that converted the 5\' end of intron 27 from GT to AT. This mutation was found in both 2 affected individuals but 9 unaffected relatives and the 50 controls were not observed, which was consistent with the clinical diagnosis. This mutation (c.1875+1G>A) appeared to be novel, which is neither reported in literature nor registered in the Database of Collagen Mutations. The heterozygous states of patients\' intron 27 were confirmed by PCR-SSP. CONCLUSION: We identify a novel RNA-splicing mutation (c.1875+1G>A) in COL1A1 gene resulting in OI type I in a Chinese family. The detailed molecular and clinical features will be useful for extending the evidence for genetic and phenotypic heterogeneity in OI and exploring the phenotype-genotype correlations in OI.'
        }];

    });