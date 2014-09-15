'use strict';

// http://118.138.241.167:8080/phenopub/autocomplete?start=ma - works
// http://localhost:9000/phenopub/search?hpo=HP:0000256&mesh=  - works
// http://118.138.241.167:8080/phenopub/search?hpo=HP:0000256,HP:0002664&mesh= - kills server
/**
 * @ngdoc function
 * @name skeletomePubmedAnnotatorApp.controller:ResultsCtrl
 * @description
 * # ResultsCtrl
 * Controller of the skeletomePubmedAnnotatorApp
 */
angular.module('skeletomePubmedAnnotatorApp')
    .controller('ResultsCtrl', function($scope, $stateParams, $http, searchbar) {
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        $scope.allPubmeds = null;
        $scope.meshes = null;
        $scope.hpos = null;
        $scope.filterByTerms = [];
        $scope.loadMore = function() {
            $scope.pubmedDisplayLimit = Math.min($scope.pubmedDisplayLimit + 10, $scope.pubmeds.length);
            loadFullPubmeds($scope.pubmeds, $scope.pubmedDisplayLimit);
        };

        var PUBMED_DISPLAY_LIMIT_DEFAULT = 10;
        $scope.pubmedDisplayLimit = PUBMED_DISPLAY_LIMIT_DEFAULT;


        $scope.toggleFilter = function(term) {
            // console.log('term', term);
            $scope.hpoSearch = '';
            term.isFiltering = !term.isFiltering;
            if (term.isFiltering) {
                $scope.filterByTerms.push(term);
            } else {
                var index = $scope.filterByTerms.indexOf(term);
                $scope.filterByTerms.splice(index, 1);
            }

            filterPubmedsByTerms($scope.filterByTerms);
        };

        function filterPubmedsByTerms(terms) {
            $scope.pubmedDisplayLimit = PUBMED_DISPLAY_LIMIT_DEFAULT;
            $scope.pubmeds = _.filter($scope.allPubmeds, function(pubmed) {
                //for each tern, there exists a property that matches
                var doesMatch = true;

                _.each(terms, function(term) {

                    if (term.type === 'hpo') {
                        doesMatch = doesMatch && !!_.findWhere(pubmed.hpo, {
                            id: term.id
                        });
                    }
                    if (term.type === 'mesh') {
                        doesMatch = doesMatch && !!_.findWhere(pubmed.mesh, {
                            id: term.id
                        });
                    }
                });
                return doesMatch;
            });
        }

        $scope.$watchCollection('searchbar.terms', function() {
            $scope.allPubmeds = null;
            $scope.pubmeds = null;
        });

        function search(terms) {
            console.log('searching with terms', terms);
            var hpoIds = _.reduce(terms, function(hpoIds, term) {
                if (term.type === 'hpo') {
                    hpoIds.push(term.id);
                }
                return hpoIds;
            }, []);

            var meshIds = _.reduce(terms, function(meshIds, term) {
                if (term.type === 'mesh') {
                    meshIds.push(term.id);
                }
                return meshIds;
            }, []);

            angular.copy(terms, searchbar.terms);
            $http.get('http://118.138.241.167:8080/phenopub/search?hpo=' + hpoIds.join(',') + '&mesh=' + meshIds.join(',')).success(function(data) {
                $scope.allPubmeds = _.values(data);

                $scope.pubmedDisplayLimit = Math.min(PUBMED_DISPLAY_LIMIT_DEFAULT, $scope.allPubmeds.length);

                _.each(data, function(pubmed) {
                    pubmed.id = pubmed.pmid;
                    _.each(pubmed.hpo, function(hpo, key) {
                        hpo.id = key;
                        hpo.type = 'hpo';
                        hpo.text = hpo.label + ' (HPO)';
                    });
                    _.each(pubmed.mesh, function(mesh) {
                        // mesh.id = m;
                        mesh.type = 'mesh';
                        mesh.text = mesh.label + ' (MeSH)';
                    });
                    pubmed.hpo = _.values(pubmed.hpo);
                    pubmed.mesh = _.values(pubmed.mesh);
                });
                $scope.pubmeds = $scope.allPubmeds;
            });
        }

        search(angular.fromJson($stateParams.terms));


        function loadFullPubmeds(pubmeds, limit) {
            // Get the descriptions for the first 10 pubmeds
            // Now load in all the pubmed info
            // Get all the pmids for the first few
            var firstPubmeds = pubmeds.slice(0, limit);
            var pmids = _.reduce(firstPubmeds, function(pmids, pubmed) {
                if (!pubmed.abstract) {
                    pmids.push(pubmed.pmid);
                }
                return pmids;
            }, []);

            // console.log('all pubmeds', $scope.allPubmeds);
            if (pmids.length) {
                $http.get('http://118.138.241.167:8080/phenopub/search?pmid=' + pmids.join(',')).success(function(fullPubmeds) {
                    _.each(fullPubmeds, function(fullPubmed, key) {
                        var pubmed = _.findWhere($scope.allPubmeds, {
                            id: key
                        });
                        _.extend(pubmed, fullPubmed);
                    });
                });
            }
        }

        // Analyse pubmed results loop
        $scope.$watchCollection('pubmeds', function(pubmeds) {
            if (!pubmeds) {
                return;
            }

            loadFullPubmeds(pubmeds, $scope.pubmedDisplayLimit);

            // Get all the hpos
            $scope.hpos = _.reduce($scope.pubmeds, function(allHpos, pubmed) {
                _.each(pubmed.hpo, function(hpo) {

                    var existingHpo = _.findWhere(allHpos, {
                        id: hpo.id
                    });
                    if (existingHpo) {
                        existingHpo.count++;
                    } else {
                        hpo.count = 1;
                        allHpos.push(hpo);
                    }

                    // filtering?
                    hpo.isFiltering = !!_.findWhere($scope.filterByTerms, {
                        id: hpo.id,
                        type: 'hpo'
                    });

                });
                return allHpos;
            }, []);

            $scope.meshes = _.reduce($scope.pubmeds, function(allMeshes, pubmed) {
                // $log.debug('Generating meshes');
                _.each(pubmed.mesh, function(mesh) {
                    // mesh.type = 'mesh';
                    // mesh.text = mesh.label + ' (MeSH)';
                    var existingMesh = _.findWhere(allMeshes, {
                        id: mesh.id
                    });
                    if (existingMesh) {
                        existingMesh.count++;
                    } else {
                        if (mesh.label === 'Hypertension') {
                            // $log.debug('MeSH is hypertension', mesh);
                        }

                        mesh.count = 1;
                        allMeshes.push(mesh);
                    }

                    // filtering?
                    mesh.isFiltering = !!_.findWhere($scope.filterByTerms, {
                        id: mesh.id,
                        type: 'mesh'
                    });

                });
                return allMeshes;
            }, []);


        });

        // function go() {



        /*
            $scope.pubmeds = _.values({
                '0': {
                    'pmid': '22704020',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0100309': {
                            'label': 'Subdural hemorrhage',
                            'ic': '8.076028552364047'
                        },
                        'HP:0004481': {
                            'label': 'Progressive macrocephaly',
                            'ic': '11.408859432744508'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D011218',
                            'label': 'Prader-Willi Syndrome'
                        },
                        '1': {
                            'id': 'D004211',
                            'label': 'Disseminated Intravascular Coagulation'
                        },
                        '2': {
                            'id': 'D006408',
                            'label': 'Hematoma, Subdural'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '1': {
                    'pmid': '22029941',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0004481': {
                            'label': 'Progressive macrocephaly',
                            'ic': '11.408859432744508'
                        },
                        'HP:0001052': {
                            'label': 'Nevus flammeus',
                            'ic': '8.68112127667008'
                        },
                        'HP:0000271': {
                            'label': 'Abnormality of the face',
                            'ic': '3.1332819895642956'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        },
                        'HP:0001513': {
                            'label': 'Obesity',
                            'ic': '3.7945040117980566'
                        },
                        'HP:0001388': {
                            'label': 'Joint laxity',
                            'ic': '8.85749724082928'
                        },
                        'HP:0010713': {
                            'label': '1-5 toe syndactyly',
                            'ic': '10.576713377377908'
                        },
                        'HP:0000293': {
                            'label': 'Full cheeks',
                            'ic': '10.742380499266725'
                        },
                        'HP:0001548': {
                            'label': 'Overgrowth',
                            'ic': '6.502285952824843'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D054079',
                            'label': 'Vascular Malformations'
                        },
                        '1': {
                            'id': 'D013577',
                            'label': 'Syndrome'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '2': {
                    'pmid': '23581647',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000729': {
                            'label': 'Autistic behavior',
                            'ic': '6.547823786640093'
                        },
                        'HP:0000717': {
                            'label': 'Autism',
                            'ic': '6.88269448109567'
                        },
                        'HP:0000252': {
                            'label': 'Microcephaly',
                            'ic': '7.248332963641107'
                        },
                        'HP:0004482': {
                            'label': 'Relative macrocephaly',
                            'ic': '10.524657015421855'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D001724',
                            'label': 'Birth Weight'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '2': {
                            'id': 'D008831',
                            'label': 'Microcephaly'
                        }
                    }
                },
                '3': {
                    'pmid': '21211577',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0001004': {
                            'label': 'Lymphedema',
                            'ic': '7.155863057814359'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000822': {
                            'label': 'Hypertension',
                            'ic': '3.26682678548737'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        },
                        'HP:0001513': {
                            'label': 'Obesity',
                            'ic': '3.7945040117980566'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D025063',
                            'label': 'Chromosome Disorders'
                        },
                        '1': {
                            'id': 'D008209',
                            'label': 'Lymphedema'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D009765',
                            'label': 'Obesity'
                        },
                        '4': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        },
                        '5': {
                            'id': 'D013577',
                            'label': 'Syndrome'
                        },
                        '6': {
                            'id': 'D002869',
                            'label': 'Chromosome Aberrations'
                        }
                    }
                },
                '4': {
                    'pmid': '23713016',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000365': {
                            'label': 'Hearing impairment',
                            'ic': '4.899724320968722'
                        },
                        'HP:0000234': {
                            'label': 'Abnormality of the head',
                            'ic': '2.9570565871538035'
                        },
                        'HP:0000252': {
                            'label': 'Microcephaly',
                            'ic': '7.248332963641107'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D006319',
                            'label': 'Hearing Loss, Sensorineural'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '2': {
                            'id': 'D008831',
                            'label': 'Microcephaly'
                        }
                    }
                },
                '5': {
                    'pmid': '22228622',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002126': {
                            'label': 'Polymicrogyria',
                            'ic': '9.05664910246361'
                        },
                        'HP:0000238': {
                            'label': 'Hydrocephalus',
                            'ic': '5.889013853927892'
                        },
                        'HP:0001355': {
                            'label': 'Megalencephaly',
                            'ic': '9.333813502537712'
                        },
                        'HP:0010442': {
                            'label': 'Polydactyly',
                            'ic': '7.906520950967236'
                        },
                        'HP:0004691': {
                            'label': '2-3 toe syndactyly',
                            'ic': '8.448845241792597'
                        },
                        'HP:0002282': {
                            'label': 'Heterotopia',
                            'ic': '8.26048137054268'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D003240',
                            'label': 'Connective Tissue Diseases'
                        },
                        '1': {
                            'id': 'D013576',
                            'label': 'Syndactyly'
                        },
                        '2': {
                            'id': 'D054220',
                            'label': 'Malformations of Cortical Development'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '4': {
                            'id': 'D017689',
                            'label': 'Polydactyly'
                        },
                        '5': {
                            'id': 'D006849',
                            'label': 'Hydrocephalus'
                        }
                    }
                },
                '6': {
                    'pmid': '21969460',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000717': {
                            'label': 'Autism',
                            'ic': '6.88269448109567'
                        },
                        'HP:0001548': {
                            'label': 'Overgrowth',
                            'ic': '6.502285952824843'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '1': {
                            'id': 'D001835',
                            'label': 'Body Weight'
                        }
                    }
                },
                '7': {
                    'pmid': '22043478',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0002251': {
                            'label': 'Aganglionic megacolon',
                            'ic': '7.259340229426885'
                        },
                        'HP:0010740': {
                            'label': 'Osteopathia striata',
                            'ic': '10.997563404325552'
                        },
                        'HP:0001371': {
                            'label': 'Flexion contracture',
                            'ic': '5.950693365254576'
                        },
                        'HP:0001638': {
                            'label': 'Cardiomyopathy',
                            'ic': '4.803134283080039'
                        },
                        'HP:0003881': {
                            'label': 'Humeral sclerosis',
                            'ic': '4.56023975314421'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D040181',
                            'label': 'Genetic Diseases, X-Linked'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '2': {
                            'id': 'D010026',
                            'label': 'Osteosclerosis'
                        }
                    }
                },
                '8': {
                    'pmid': '22107929',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0007354': {
                            'label': 'Amyotrophic lateral sclerosis',
                            'ic': '4.470302724140585'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        },
                        'HP:0001513': {
                            'label': 'Obesity',
                            'ic': '3.7945040117980566'
                        },
                        'HP:0000855': {
                            'label': 'Insulin resistance',
                            'ic': '4.650255654428466'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D007805',
                            'label': 'Language Development Disorders'
                        },
                        '1': {
                            'id': 'D002869',
                            'label': 'Chromosome Aberrations'
                        },
                        '2': {
                            'id': 'D014314',
                            'label': 'Trisomy'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '9': {
                    'pmid': '22094746',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0002591': {
                            'label': 'Polyphagia',
                            'ic': '2.169065867918621'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D016063',
                            'label': 'Blood Loss, Surgical'
                        },
                        '1': {
                            'id': 'D011183',
                            'label': 'Postoperative Complications'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D006849',
                            'label': 'Hydrocephalus'
                        }
                    }
                },
                '10': {
                    'pmid': '22422204',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002352': {
                            'label': 'Leukoencephalopathy',
                            'ic': '6.782339828741939'
                        },
                        'HP:0003429': {
                            'label': 'CNS hypomyelination',
                            'ic': '8.95062103003867'
                        },
                        'HP:0000509': {
                            'label': 'Conjunctivitis',
                            'ic': '4.855350970295627'
                        },
                        'HP:0003150': {
                            'label': 'Glutaric aciduria',
                            'ic': '9.725062952991863'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000238': {
                            'label': 'Hydrocephalus',
                            'ic': '5.889013853927892'
                        },
                        'HP:0001251': {
                            'label': 'Ataxia',
                            'ic': '5.472156792589481'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D001927',
                            'label': 'Brain Diseases'
                        },
                        '1': {
                            'id': 'D020279',
                            'label': 'Hereditary Central Nervous System Demyelinating Diseases'
                        },
                        '2': {
                            'id': 'D003560',
                            'label': 'Cysts'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '4': {
                            'id': 'D056784',
                            'label': 'Leukoencephalopathies'
                        }
                    }
                },
                '11': {
                    'pmid': '21194289',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0004481': {
                            'label': 'Progressive macrocephaly',
                            'ic': '11.408859432744508'
                        },
                        'HP:0100702': {
                            'label': 'Arachnoid cyst',
                            'ic': '7.863587023243837'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D016080',
                            'label': 'Arachnoid Cysts'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '12': {
                    'pmid': '21215908',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000729': {
                            'label': 'Autistic behavior',
                            'ic': '6.547823786640093'
                        },
                        'HP:0000234': {
                            'label': 'Abnormality of the head',
                            'ic': '2.9570565871538035'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '13': {
                    'pmid': '23592320',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002126': {
                            'label': 'Polymicrogyria',
                            'ic': '9.05664910246361'
                        },
                        'HP:0001770': {
                            'label': 'Toe syndactyly',
                            'ic': '8.21629155951231'
                        },
                        'HP:0007100': {
                            'label': 'Progressive ventriculomegaly',
                            'ic': '11.2178041959818'
                        },
                        'HP:0002308': {
                            'label': 'Arnold-Chiari malformation',
                            'ic': '7.801741999734059'
                        },
                        'HP:0006101': {
                            'label': 'Finger syndactyly',
                            'ic': '9.962972974422373'
                        },
                        'HP:0000238': {
                            'label': 'Hydrocephalus',
                            'ic': '5.889013853927892'
                        },
                        'HP:0001355': {
                            'label': 'Megalencephaly',
                            'ic': '9.333813502537712'
                        },
                        'HP:0100259': {
                            'label': 'Postaxial polydactyly',
                            'ic': '9.390453781651042'
                        },
                        'HP:0100522': {
                            'label': 'Thymoma',
                            'ic': '6.949628121898576'
                        },
                        'HP:0001548': {
                            'label': 'Overgrowth',
                            'ic': '6.502285952824843'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D013577',
                            'label': 'Syndrome'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '14': {
                    'pmid': '22884750',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002308': {
                            'label': 'Arnold-Chiari malformation',
                            'ic': '7.801741999734059'
                        },
                        'HP:0006101': {
                            'label': 'Finger syndactyly',
                            'ic': '9.962972974422373'
                        },
                        'HP:0004691': {
                            'label': '2-3 toe syndactyly',
                            'ic': '8.448845241792597'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000238': {
                            'label': 'Hydrocephalus',
                            'ic': '5.889013853927892'
                        },
                        'HP:0001561': {
                            'label': 'Polyhydramnios',
                            'ic': '7.879407715558675'
                        },
                        'HP:0002664': {
                            'label': 'Neoplasm',
                            'ic': '0.8645402153104755'
                        },
                        'HP:0000951': {
                            'label': 'Abnormality of the skin',
                            'ic': '2.6776901975288276'
                        },
                        'HP:0001520': {
                            'label': 'Large for gestational age',
                            'ic': '7.604929718440271'
                        },
                        'HP:0000965': {
                            'label': 'Cutis marmorata',
                            'ic': '8.81990892318343'
                        },
                        'HP:0007206': {
                            'label': 'Hemimegalencephaly',
                            'ic': '9.86841439179736'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D013684',
                            'label': 'Telangiectasis'
                        },
                        '1': {
                            'id': 'D017445',
                            'label': 'Skin Diseases, Vascular'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        }
                    }
                },
                '15': {
                    'pmid': '21343951',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0010566': {
                            'label': 'Hamartoma',
                            'ic': '6.436126423065174'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0100646': {
                            'label': 'Thyroiditis',
                            'ic': '4.373868855799664'
                        },
                        'HP:0003002': {
                            'label': 'Breast carcinoma',
                            'ic': '3.607618868927761'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D004195',
                            'label': 'Disease Models, Animal'
                        },
                        '1': {
                            'id': 'D006223',
                            'label': 'Hamartoma Syndrome, Multiple'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '16': {
                    'pmid': '22729224',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002126': {
                            'label': 'Polymicrogyria',
                            'ic': '9.05664910246361'
                        },
                        'HP:0000238': {
                            'label': 'Hydrocephalus',
                            'ic': '5.889013853927892'
                        },
                        'HP:0001355': {
                            'label': 'Megalencephaly',
                            'ic': '9.333813502537712'
                        },
                        'HP:0010442': {
                            'label': 'Polydactyly',
                            'ic': '7.906520950967236'
                        },
                        'HP:0001548': {
                            'label': 'Overgrowth',
                            'ic': '6.502285952824843'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D013577',
                            'label': 'Syndrome'
                        },
                        '1': {
                            'id': 'D054220',
                            'label': 'Malformations of Cortical Development'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D006849',
                            'label': 'Hydrocephalus'
                        }
                    }
                },
                '17': {
                    'pmid': '22451530',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002126': {
                            'label': 'Polymicrogyria',
                            'ic': '9.05664910246361'
                        },
                        'HP:0001636': {
                            'label': 'Tetralogy of Fallot',
                            'ic': '7.078356959364433'
                        },
                        'HP:0005306': {
                            'label': 'Capillary hemangiomas',
                            'ic': '8.68571898591871'
                        },
                        'HP:0000348': {
                            'label': 'High forehead',
                            'ic': '10.395664895230752'
                        },
                        'HP:0001528': {
                            'label': 'Hemihypertrophy',
                            'ic': '9.611269043205661'
                        },
                        'HP:0008947': {
                            'label': 'Infantile muscular hypotonia',
                            'ic': '7.437905705799601'
                        },
                        'HP:0001162': {
                            'label': 'Postaxial hand polydactyly',
                            'ic': '11.308775974187526'
                        },
                        'HP:0000973': {
                            'label': 'Cutis laxa',
                            'ic': '8.949120654663435'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        },
                        'HP:0001388': {
                            'label': 'Joint laxity',
                            'ic': '8.85749724082928'
                        },
                        'HP:0000951': {
                            'label': 'Abnormality of the skin',
                            'ic': '2.6776901975288276'
                        },
                        'HP:0001520': {
                            'label': 'Large for gestational age',
                            'ic': '7.604929718440271'
                        },
                        'HP:0001159': {
                            'label': 'Syndactyly',
                            'ic': '7.961381298518347'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D013771',
                            'label': 'Tetralogy of Fallot'
                        },
                        '1': {
                            'id': 'D012868',
                            'label': 'Skin Abnormalities'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D020225',
                            'label': 'Sagittal Sinus Thrombosis'
                        }
                    }
                },
                '18': {
                    'pmid': '22488832',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000707': {
                            'label': 'Abnormality of the nervous system',
                            'ic': '0.6962397708457502'
                        },
                        'HP:0001634': {
                            'label': 'Mitral valve prolapse',
                            'ic': '7.53037506844551'
                        },
                        'HP:0001525': {
                            'label': 'Severe failure to thrive',
                            'ic': '10.281426705540907'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0002664': {
                            'label': 'Neoplasm',
                            'ic': '0.8645402153104755'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        },
                        'HP:0001639': {
                            'label': 'Hypertrophic cardiomyopathy',
                            'ic': '6.441607891202612'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '1': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        },
                        '2': {
                            'id': 'D056685',
                            'label': 'Costello Syndrome'
                        }
                    }
                },
                '19': {
                    'pmid': '21464237',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0004481': {
                            'label': 'Progressive macrocephaly',
                            'ic': '11.408859432744508'
                        },
                        'HP:0000729': {
                            'label': 'Autistic behavior',
                            'ic': '6.547823786640093'
                        },
                        'HP:0000234': {
                            'label': 'Abnormality of the head',
                            'ic': '2.9570565871538035'
                        },
                        'HP:0000717': {
                            'label': 'Autism',
                            'ic': '6.88269448109567'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D007805',
                            'label': 'Language Development Disorders'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '20': {
                    'pmid': '22986529',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002664': {
                            'label': 'Neoplasm',
                            'ic': '0.8645402153104755'
                        },
                        'HP:0000718': {
                            'label': 'Aggressive behavior',
                            'ic': '4.038352634808045'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D001932',
                            'label': 'Brain Neoplasms'
                        },
                        '1': {
                            'id': 'D006965',
                            'label': 'Hyperplasia'
                        },
                        '2': {
                            'id': 'D013736',
                            'label': 'Testicular Neoplasms'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '21': {
                    'pmid': '22329570',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001548': {
                            'label': 'Overgrowth',
                            'ic': '6.502285952824843'
                        },
                        'HP:0011675': {
                            'label': 'Arrhythmia',
                            'ic': '3.2497205823131106'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D020785',
                            'label': 'Central Nervous System Vascular Malformations'
                        },
                        '1': {
                            'id': 'D005315',
                            'label': 'Fetal Diseases'
                        },
                        '2': {
                            'id': 'D019339',
                            'label': 'Port-Wine Stain'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '4': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        },
                        '5': {
                            'id': 'D013684',
                            'label': 'Telangiectasis'
                        },
                        '6': {
                            'id': 'D017445',
                            'label': 'Skin Diseases, Vascular'
                        },
                        '7': {
                            'id': 'D013617',
                            'label': 'Tachycardia, Supraventricular'
                        }
                    }
                },
                '22': {
                    'pmid': '20833799',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0004322': {
                            'label': 'Short stature',
                            'ic': '6.3961210884514745'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        },
                        'HP:0001250': {
                            'label': 'Seizures',
                            'ic': '3.868405623660624'
                        },
                        'HP:0001339': {
                            'label': 'Lissencephaly',
                            'ic': '8.852040201366222'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D013577',
                            'label': 'Syndrome'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '2': {
                            'id': 'D004829',
                            'label': 'Epilepsy, Generalized'
                        },
                        '3': {
                            'id': 'D002872',
                            'label': 'Chromosome Deletion'
                        }
                    }
                },
                '23': {
                    'pmid': '21077203',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0001548': {
                            'label': 'Overgrowth',
                            'ic': '6.502285952824843'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D013684',
                            'label': 'Telangiectasis'
                        },
                        '1': {
                            'id': 'D017445',
                            'label': 'Skin Diseases, Vascular'
                        },
                        '2': {
                            'id': 'D013577',
                            'label': 'Syndrome'
                        },
                        '3': {
                            'id': 'D019339',
                            'label': 'Port-Wine Stain'
                        },
                        '4': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '5': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        }
                    }
                },
                '24': {
                    'pmid': '24032289',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0001999': {
                            'label': 'Abnormal facial shape',
                            'ic': '6.6793003972983165'
                        },
                        'HP:0000485': {
                            'label': 'Megalocornea',
                            'ic': '10.742380499266725'
                        },
                        'HP:0001249': {
                            'label': 'Intellectual disability',
                            'ic': '5.272952836550954'
                        },
                        'HP:0008947': {
                            'label': 'Infantile muscular hypotonia',
                            'ic': '7.437905705799601'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D002547',
                            'label': 'Cerebral Palsy'
                        },
                        '1': {
                            'id': 'D008607',
                            'label': 'Intellectual Disability'
                        },
                        '2': {
                            'id': 'D003316',
                            'label': 'Corneal Diseases'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '25': {
                    'pmid': '22284829',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0001084': {
                            'label': 'Corneal arcus',
                            'ic': '10.656120154982318'
                        },
                        'HP:0007819': {
                            'label': 'Presenile cataracts',
                            'ic': '11.021093901735746'
                        },
                        'HP:0000485': {
                            'label': 'Megalocornea',
                            'ic': '10.742380499266725'
                        },
                        'HP:0007705': {
                            'label': 'Corneal degeneration',
                            'ic': '10.148605792519984'
                        },
                        'HP:0007765': {
                            'label': 'Deep anterior chamber',
                            'ic': '11.247218081188093'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D002547',
                            'label': 'Cerebral Palsy'
                        },
                        '1': {
                            'id': 'D040181',
                            'label': 'Genetic Diseases, X-Linked'
                        },
                        '2': {
                            'id': 'D008607',
                            'label': 'Intellectual Disability'
                        },
                        '3': {
                            'id': 'D003316',
                            'label': 'Corneal Diseases'
                        },
                        '4': {
                            'id': 'D005124',
                            'label': 'Eye Abnormalities'
                        },
                        '5': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '26': {
                    'pmid': '22718406',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0001287': {
                            'label': 'Meningitis',
                            'ic': '5.1412927606157055'
                        },
                        'HP:0002586': {
                            'label': 'Peritonitis',
                            'ic': '4.465584613490862'
                        },
                        'HP:0100702': {
                            'label': 'Arachnoid cyst',
                            'ic': '7.863587023243837'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D007235',
                            'label': 'Infant, Premature, Diseases'
                        },
                        '1': {
                            'id': 'D004200',
                            'label': 'Diseases in Twins'
                        },
                        '2': {
                            'id': 'D005330',
                            'label': 'Fetofetal Transfusion'
                        },
                        '3': {
                            'id': 'D061085',
                            'label': 'Agenesis of Corpus Callosum'
                        },
                        '4': {
                            'id': 'D009436',
                            'label': 'Neural Tube Defects'
                        },
                        '5': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '27': {
                    'pmid': '23338097',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000365': {
                            'label': 'Hearing impairment',
                            'ic': '4.899724320968722'
                        },
                        'HP:0011445': {
                            'label': 'Athetoid cerebral palsy',
                            'ic': '10.503150810200891'
                        },
                        'HP:0001249': {
                            'label': 'Intellectual disability',
                            'ic': '5.272952836550954'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000238': {
                            'label': 'Hydrocephalus',
                            'ic': '5.889013853927892'
                        },
                        'HP:0001250': {
                            'label': 'Seizures',
                            'ic': '3.868405623660624'
                        },
                        'HP:0000824': {
                            'label': 'Growth hormone deficiency',
                            'ic': '7.5267531883543555'
                        },
                        'HP:0001510': {
                            'label': 'Growth delay',
                            'ic': '4.928949418670003'
                        },
                        'HP:0000691': {
                            'label': 'Microdontia',
                            'ic': '9.967113767088405'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D008607',
                            'label': 'Intellectual Disability'
                        },
                        '1': {
                            'id': 'D004827',
                            'label': 'Epilepsy'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D006849',
                            'label': 'Hydrocephalus'
                        }
                    }
                },
                '28': {
                    'pmid': '22887875',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0004482': {
                            'label': 'Relative macrocephaly',
                            'ic': '10.524657015421855'
                        },
                        'HP:0004322': {
                            'label': 'Short stature',
                            'ic': '6.3961210884514745'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D004392',
                            'label': 'Dwarfism'
                        },
                        '1': {
                            'id': 'D025063',
                            'label': 'Chromosome Disorders'
                        },
                        '2': {
                            'id': 'D056730',
                            'label': 'Silver-Russell Syndrome'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '4': {
                            'id': 'D002872',
                            'label': 'Chromosome Deletion'
                        }
                    }
                },
                '29': {
                    'pmid': '23772884',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0001510': {
                            'label': 'Growth delay',
                            'ic': '4.928949418670003'
                        },
                        'HP:0000252': {
                            'label': 'Microcephaly',
                            'ic': '7.248332963641107'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '1': {
                            'id': 'D008831',
                            'label': 'Microcephaly'
                        },
                        '2': {
                            'id': 'D008607',
                            'label': 'Intellectual Disability'
                        }
                    }
                },
                '30': {
                    'pmid': '24046992',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000696': {
                            'label': 'Delayed eruption of permanent teeth',
                            'ic': '11.73833863387475'
                        },
                        'HP:0010740': {
                            'label': 'Osteopathia striata',
                            'ic': '10.997563404325552'
                        },
                        'HP:0000679': {
                            'label': 'Taurodontia',
                            'ic': '10.345965226678478'
                        },
                        'HP:0000164': {
                            'label': 'Abnormality of the teeth',
                            'ic': '4.283802192765608'
                        },
                        'HP:0003881': {
                            'label': 'Humeral sclerosis',
                            'ic': '4.56023975314421'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D002972',
                            'label': 'Cleft Palate'
                        },
                        '1': {
                            'id': 'D003784',
                            'label': 'Dental Pulp Calcification'
                        },
                        '2': {
                            'id': 'D014071',
                            'label': 'Tooth Abnormalities'
                        },
                        '3': {
                            'id': 'D010026',
                            'label': 'Osteosclerosis'
                        },
                        '4': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '5': {
                            'id': 'D005671',
                            'label': 'Fused Teeth'
                        }
                    }
                },
                '31': {
                    'pmid': '21821449',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002205': {
                            'label': 'Recurrent respiratory infections',
                            'ic': '5.446905004852582'
                        },
                        'HP:0008947': {
                            'label': 'Infantile muscular hypotonia',
                            'ic': '7.437905705799601'
                        },
                        'HP:0001257': {
                            'label': 'Spasticity',
                            'ic': '5.9541382874063045'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000400': {
                            'label': 'Macrotia',
                            'ic': '9.761551246255'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        },
                        'HP:0001250': {
                            'label': 'Seizures',
                            'ic': '3.868405623660624'
                        },
                        'HP:0010864': {
                            'label': 'Intellectual disability, severe',
                            'ic': '7.505647056998518'
                        },
                        'HP:0002019': {
                            'label': 'Constipation',
                            'ic': '6.1016344883053595'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D009123',
                            'label': 'Muscle Hypotonia'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '2': {
                            'id': 'D003248',
                            'label': 'Constipation'
                        },
                        '3': {
                            'id': 'D012640',
                            'label': 'Seizures'
                        },
                        '4': {
                            'id': 'D009422',
                            'label': 'Nervous System Diseases'
                        },
                        '5': {
                            'id': 'D018450',
                            'label': 'Disease Progression'
                        },
                        '6': {
                            'id': 'D012141',
                            'label': 'Respiratory Tract Infections'
                        }
                    }
                },
                '32': {
                    'pmid': '21815251',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000470': {
                            'label': 'Short neck',
                            'ic': '8.813342911412539'
                        },
                        'HP:0000369': {
                            'label': 'Low-set ears',
                            'ic': '8.892295463085818'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        },
                        'HP:0001250': {
                            'label': 'Seizures',
                            'ic': '3.868405623660624'
                        },
                        'HP:0002057': {
                            'label': 'Prominent glabella',
                            'ic': '12.618697356522842'
                        },
                        'HP:0001000': {
                            'label': 'Abnormality of skin pigmentation',
                            'ic': '4.896280270287053'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D054877',
                            'label': 'Wolf-Hirschhorn Syndrome'
                        },
                        '1': {
                            'id': 'D007499',
                            'label': 'Iris Diseases'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D010859',
                            'label': 'Pigmentation Disorders'
                        },
                        '4': {
                            'id': 'D058674',
                            'label': 'Chromosome Duplication'
                        },
                        '5': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        },
                        '6': {
                            'id': 'D002869',
                            'label': 'Chromosome Aberrations'
                        }
                    }
                },
                '33': {
                    'pmid': '20734344',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0100954': {
                            'label': 'Open operculum',
                            'ic': '13.842472788144958'
                        },
                        'HP:0002119': {
                            'label': 'Ventriculomegaly',
                            'ic': '6.4139019513674835'
                        },
                        'HP:0002389': {
                            'label': 'Cavum septum pellucidum',
                            'ic': '10.807519801437687'
                        },
                        'HP:0000717': {
                            'label': 'Autism',
                            'ic': '6.88269448109567'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D013577',
                            'label': 'Syndrome'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '2': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        }
                    }
                },
                '34': {
                    'pmid': '20878720',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        },
                        'HP:0000717': {
                            'label': 'Autism',
                            'ic': '6.88269448109567'
                        },
                        'HP:0000733': {
                            'label': 'Stereotypic behavior',
                            'ic': '7.761624679902291'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D009422',
                            'label': 'Nervous System Diseases'
                        },
                        '1': {
                            'id': 'D007154',
                            'label': 'Immune System Diseases'
                        },
                        '2': {
                            'id': 'D012678',
                            'label': 'Sensation Disorders'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '4': {
                            'id': 'D021081',
                            'label': 'Chronobiology Disorders'
                        }
                    }
                },
                '35': {
                    'pmid': '21109730',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0007206': {
                            'label': 'Hemimegalencephaly',
                            'ic': '9.86841439179736'
                        },
                        'HP:0001548': {
                            'label': 'Overgrowth',
                            'ic': '6.502285952824843'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D054220',
                            'label': 'Malformations of Cortical Development'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '36': {
                    'pmid': '21834033',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        },
                        'HP:0001249': {
                            'label': 'Intellectual disability',
                            'ic': '5.272952836550954'
                        },
                        'HP:0001382': {
                            'label': 'Joint hypermobility',
                            'ic': '7.02114723716121'
                        },
                        'HP:0000974': {
                            'label': 'Hyperextensible skin',
                            'ic': '10.013831391655863'
                        },
                        'HP:0001548': {
                            'label': 'Overgrowth',
                            'ic': '6.502285952824843'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D008382',
                            'label': 'Marfan Syndrome'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '2': {
                            'id': 'D058495',
                            'label': 'Sotos Syndrome'
                        },
                        '3': {
                            'id': 'D019465',
                            'label': 'Craniofacial Abnormalities'
                        },
                        '4': {
                            'id': 'D002872',
                            'label': 'Chromosome Deletion'
                        }
                    }
                },
                '37': {
                    'pmid': '22056141',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000707': {
                            'label': 'Abnormality of the nervous system',
                            'ic': '0.6962397708457502'
                        },
                        'HP:0009716': {
                            'label': 'Subependymal nodules',
                            'ic': '10.461478113800323'
                        },
                        'HP:0003881': {
                            'label': 'Humeral sclerosis',
                            'ic': '4.56023975314421'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D014402',
                            'label': 'Tuberous Sclerosis'
                        },
                        '1': {
                            'id': 'D004827',
                            'label': 'Epilepsy'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '38': {
                    'pmid': '23231470',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000238': {
                            'label': 'Hydrocephalus',
                            'ic': '5.889013853927892'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '1': {
                            'id': 'D006849',
                            'label': 'Hydrocephalus'
                        }
                    }
                },
                '39': {
                    'pmid': '21419380',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002415': {
                            'label': 'Leukodystrophy',
                            'ic': '8.126103197983287'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0002352': {
                            'label': 'Leukoencephalopathy',
                            'ic': '6.782339828741939'
                        },
                        'HP:0002344': {
                            'label': 'Progressive neurologic deterioration',
                            'ic': '7.0977071376572844'
                        },
                        'HP:0001249': {
                            'label': 'Intellectual disability',
                            'ic': '5.272952836550954'
                        },
                        'HP:0000717': {
                            'label': 'Autism',
                            'ic': '6.88269448109567'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D008607',
                            'label': 'Intellectual Disability'
                        },
                        '1': {
                            'id': 'D020279',
                            'label': 'Hereditary Central Nervous System Demyelinating Diseases'
                        },
                        '2': {
                            'id': 'D003560',
                            'label': 'Cysts'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '40': {
                    'pmid': '23034868',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001513': {
                            'label': 'Obesity',
                            'ic': '3.7945040117980566'
                        },
                        'HP:0001249': {
                            'label': 'Intellectual disability',
                            'ic': '5.272952836550954'
                        },
                        'HP:0001520': {
                            'label': 'Large for gestational age',
                            'ic': '7.604929718440271'
                        },
                        'HP:0002591': {
                            'label': 'Polyphagia',
                            'ic': '2.169065867918621'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D008607',
                            'label': 'Intellectual Disability'
                        },
                        '1': {
                            'id': 'D005320',
                            'label': 'Fetal Macrosomia'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D014178',
                            'label': 'Translocation, Genetic'
                        },
                        '4': {
                            'id': 'D009765',
                            'label': 'Obesity'
                        },
                        '5': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        },
                        '6': {
                            'id': 'D003103',
                            'label': 'Coloboma'
                        },
                        '7': {
                            'id': 'D020022',
                            'label': 'Genetic Predisposition to Disease'
                        }
                    }
                },
                '41': {
                    'pmid': '23382303',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0002664': {
                            'label': 'Neoplasm',
                            'ic': '0.8645402153104755'
                        },
                        'HP:0000824': {
                            'label': 'Growth hormone deficiency',
                            'ic': '7.5267531883543555'
                        },
                        'HP:0000729': {
                            'label': 'Autistic behavior',
                            'ic': '6.547823786640093'
                        },
                        'HP:0001943': {
                            'label': 'Hypoglycemia',
                            'ic': '5.620940078882108'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D006130',
                            'label': 'Growth Disorders'
                        },
                        '1': {
                            'id': 'D004392',
                            'label': 'Dwarfism'
                        },
                        '2': {
                            'id': 'D014842',
                            'label': 'von Willebrand Diseases'
                        },
                        '3': {
                            'id': 'D007003',
                            'label': 'Hypoglycemia'
                        },
                        '4': {
                            'id': 'D025861',
                            'label': 'Blood Coagulation Disorders, Inherited'
                        },
                        '5': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '42': {
                    'pmid': '23431744',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0007354': {
                            'label': 'Amyotrophic lateral sclerosis',
                            'ic': '4.470302724140585'
                        },
                        'HP:0002827': {
                            'label': 'Hip dislocation',
                            'ic': '7.327760097272429'
                        },
                        'HP:0000768': {
                            'label': 'Pectus carinatum',
                            'ic': '10.402054693329521'
                        },
                        'HP:0001999': {
                            'label': 'Abnormal facial shape',
                            'ic': '6.6793003972983165'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001561': {
                            'label': 'Polyhydramnios',
                            'ic': '7.879407715558675'
                        },
                        'HP:0002654': {
                            'label': 'Multiple epiphyseal dysplasia',
                            'ic': '10.072013347038599'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D010009',
                            'label': 'Osteochondrodysplasias'
                        },
                        '1': {
                            'id': 'D020022',
                            'label': 'Genetic Predisposition to Disease'
                        },
                        '2': {
                            'id': 'D019066',
                            'label': 'Facies'
                        },
                        '3': {
                            'id': 'D006618',
                            'label': 'Hip Dislocation, Congenital'
                        },
                        '4': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '5': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        }
                    }
                },
                '43': {
                    'pmid': '23662932',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0004947': {
                            'label': 'Arteriovenous fistula',
                            'ic': '6.5475521582260905'
                        },
                        'HP:0002516': {
                            'label': 'Increased intracranial pressure',
                            'ic': '7.362735021741498'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D020785',
                            'label': 'Central Nervous System Vascular Malformations'
                        },
                        '1': {
                            'id': 'D006223',
                            'label': 'Hamartoma Syndrome, Multiple'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '44': {
                    'pmid': '20814261',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0100646': {
                            'label': 'Thyroiditis',
                            'ic': '4.373868855799664'
                        },
                        'HP:0100699': {
                            'label': 'Scarring',
                            'ic': '4.8829812385752085'
                        },
                        'HP:0000717': {
                            'label': 'Autism',
                            'ic': '6.88269448109567'
                        },
                        'HP:0008947': {
                            'label': 'Infantile muscular hypotonia',
                            'ic': '7.437905705799601'
                        },
                        'HP:0000789': {
                            'label': 'Infertility',
                            'ic': '4.653335623819879'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001250': {
                            'label': 'Seizures',
                            'ic': '3.868405623660624'
                        },
                        'HP:0001513': {
                            'label': 'Obesity',
                            'ic': '3.7945040117980566'
                        },
                        'HP:0006781': {
                            'label': 'Hurthle cell thyroid adenoma',
                            'ic': '14.35329841191095'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D013964',
                            'label': 'Thyroid Neoplasms'
                        },
                        '1': {
                            'id': 'D006223',
                            'label': 'Hamartoma Syndrome, Multiple'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '45': {
                    'pmid': '23124040',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000729': {
                            'label': 'Autistic behavior',
                            'ic': '6.547823786640093'
                        },
                        'HP:0001249': {
                            'label': 'Intellectual disability',
                            'ic': '5.272952836550954'
                        },
                        'HP:0008947': {
                            'label': 'Infantile muscular hypotonia',
                            'ic': '7.437905705799601'
                        },
                        'HP:0010566': {
                            'label': 'Hamartoma',
                            'ic': '6.436126423065174'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0002664': {
                            'label': 'Neoplasm',
                            'ic': '0.8645402153104755'
                        },
                        'HP:0001012': {
                            'label': 'Multiple lipomas',
                            'ic': '6.867432762357225'
                        },
                        'HP:0001000': {
                            'label': 'Abnormality of skin pigmentation',
                            'ic': '4.896280270287053'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D006223',
                            'label': 'Hamartoma Syndrome, Multiple'
                        },
                        '1': {
                            'id': 'D009123',
                            'label': 'Muscle Hypotonia'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '46': {
                    'pmid': '22673385',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0200008': {
                            'label': 'Intestinal polyposis',
                            'ic': '7.148653579726118'
                        },
                        'HP:0000218': {
                            'label': 'High palate',
                            'ic': '8.971866138652405'
                        },
                        'HP:0010566': {
                            'label': 'Hamartoma',
                            'ic': '6.436126423065174'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        },
                        'HP:0000316': {
                            'label': 'Hypertelorism',
                            'ic': '8.158212979977622'
                        },
                        'HP:0001012': {
                            'label': 'Multiple lipomas',
                            'ic': '6.867432762357225'
                        },
                        'HP:0001000': {
                            'label': 'Abnormality of skin pigmentation',
                            'ic': '4.896280270287053'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D006223',
                            'label': 'Hamartoma Syndrome, Multiple'
                        },
                        '1': {
                            'id': 'D044483',
                            'label': 'Intestinal Polyposis'
                        },
                        '2': {
                            'id': 'D009386',
                            'label': 'Neoplastic Syndromes, Hereditary'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '47': {
                    'pmid': '23324646',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0100259': {
                            'label': 'Postaxial polydactyly',
                            'ic': '9.390453781651042'
                        },
                        'HP:0001305': {
                            'label': 'Dandy-Walker malformation',
                            'ic': '9.003021306432203'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D003616',
                            'label': 'Dandy-Walker Syndrome'
                        },
                        '1': {
                            'id': 'D001024',
                            'label': 'Aortic Valve Stenosis'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D017689',
                            'label': 'Polydactyly'
                        }
                    }
                },
                '48': {
                    'pmid': '22901949',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000252': {
                            'label': 'Microcephaly',
                            'ic': '7.248332963641107'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '1': {
                            'id': 'D008831',
                            'label': 'Microcephaly'
                        }
                    }
                },
                '49': {
                    'pmid': '22859694',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002126': {
                            'label': 'Polymicrogyria',
                            'ic': '9.05664910246361'
                        },
                        'HP:0010442': {
                            'label': 'Polydactyly',
                            'ic': '7.906520950967236'
                        },
                        'HP:0006136': {
                            'label': 'Bilateral postaxial polydactyly',
                            'ic': '12.561538942682894'
                        },
                        'HP:0008947': {
                            'label': 'Infantile muscular hypotonia',
                            'ic': '7.437905705799601'
                        },
                        'HP:0000238': {
                            'label': 'Hydrocephalus',
                            'ic': '5.889013853927892'
                        },
                        'HP:0001355': {
                            'label': 'Megalencephaly',
                            'ic': '9.333813502537712'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D009123',
                            'label': 'Muscle Hypotonia'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '2': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        },
                        '3': {
                            'id': 'D013577',
                            'label': 'Syndrome'
                        },
                        '4': {
                            'id': 'D054220',
                            'label': 'Malformations of Cortical Development'
                        },
                        '5': {
                            'id': 'D017689',
                            'label': 'Polydactyly'
                        },
                        '6': {
                            'id': 'D006849',
                            'label': 'Hydrocephalus'
                        }
                    }
                },
                '50': {
                    'pmid': '22258436',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000238': {
                            'label': 'Hydrocephalus',
                            'ic': '5.889013853927892'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '1': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        },
                        '2': {
                            'id': 'D038061',
                            'label': 'Lower Extremity Deformities, Congenital'
                        },
                        '3': {
                            'id': 'D013684',
                            'label': 'Telangiectasis'
                        },
                        '4': {
                            'id': 'D017445',
                            'label': 'Skin Diseases, Vascular'
                        },
                        '5': {
                            'id': 'D013577',
                            'label': 'Syndrome'
                        },
                        '6': {
                            'id': 'D019066',
                            'label': 'Facies'
                        }
                    }
                },
                '51': {
                    'pmid': '20643313',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000589': {
                            'label': 'Coloboma',
                            'ic': '8.171213505194318'
                        },
                        'HP:0000365': {
                            'label': 'Hearing impairment',
                            'ic': '4.899724320968722'
                        },
                        'HP:0000729': {
                            'label': 'Autistic behavior',
                            'ic': '6.547823786640093'
                        },
                        'HP:0000078': {
                            'label': 'Abnormality of the genital system',
                            'ic': '2.6860651366019654'
                        },
                        'HP:0000598': {
                            'label': 'Abnormality of the ear',
                            'ic': '4.121070820246405'
                        },
                        'HP:0001263': {
                            'label': 'Global developmental delay',
                            'ic': '5.8018970491649755'
                        },
                        'HP:0001510': {
                            'label': 'Growth delay',
                            'ic': '4.928949418670003'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D015518',
                            'label': 'Rett Syndrome'
                        },
                        '1': {
                            'id': 'D014424',
                            'label': 'Turner Syndrome'
                        },
                        '2': {
                            'id': 'D058747',
                            'label': 'CHARGE Syndrome'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '4': {
                            'id': 'D005600',
                            'label': 'Fragile X Syndrome'
                        },
                        '5': {
                            'id': 'D011218',
                            'label': 'Prader-Willi Syndrome'
                        },
                        '6': {
                            'id': 'D020022',
                            'label': 'Genetic Predisposition to Disease'
                        },
                        '7': {
                            'id': 'D017204',
                            'label': 'Angelman Syndrome'
                        }
                    }
                },
                '52': {
                    'pmid': '21354731',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000965': {
                            'label': 'Cutis marmorata',
                            'ic': '8.81990892318343'
                        },
                        'HP:0001355': {
                            'label': 'Megalencephaly',
                            'ic': '9.333813502537712'
                        },
                        'HP:0001548': {
                            'label': 'Overgrowth',
                            'ic': '6.502285952824843'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '1': {
                            'id': 'D020785',
                            'label': 'Central Nervous System Vascular Malformations'
                        }
                    }
                },
                '53': {
                    'pmid': '22146932',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001250': {
                            'label': 'Seizures',
                            'ic': '3.868405623660624'
                        },
                        'HP:0000729': {
                            'label': 'Autistic behavior',
                            'ic': '6.547823786640093'
                        },
                        'HP:0001249': {
                            'label': 'Intellectual disability',
                            'ic': '5.272952836550954'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D008607',
                            'label': 'Intellectual Disability'
                        },
                        '1': {
                            'id': 'D004827',
                            'label': 'Epilepsy'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D003638',
                            'label': 'Deafness'
                        },
                        '4': {
                            'id': 'D008661',
                            'label': 'Metabolism, Inborn Errors'
                        }
                    }
                },
                '54': {
                    'pmid': '23909618',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0004947': {
                            'label': 'Arteriovenous fistula',
                            'ic': '6.5475521582260905'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001635': {
                            'label': 'Congestive heart failure',
                            'ic': '4.066966345304191'
                        },
                        'HP:0001250': {
                            'label': 'Seizures',
                            'ic': '3.868405623660624'
                        },
                        'HP:0001342': {
                            'label': 'Cerebral hemorrhage',
                            'ic': '6.3224550573433405'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D002538',
                            'label': 'Intracranial Arteriovenous Malformations'
                        },
                        '1': {
                            'id': 'D002543',
                            'label': 'Cerebral Hemorrhage'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D001164',
                            'label': 'Arteriovenous Fistula'
                        },
                        '4': {
                            'id': 'D012640',
                            'label': 'Seizures'
                        }
                    }
                },
                '55': {
                    'pmid': '20582592',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001627': {
                            'label': 'Abnormality of cardiac morphology',
                            'ic': '3.096444386164023'
                        },
                        'HP:0001680': {
                            'label': 'Coarctation of aorta',
                            'ic': '7.154616330312143'
                        },
                        'HP:0000965': {
                            'label': 'Cutis marmorata',
                            'ic': '8.81990892318343'
                        },
                        'HP:0001028': {
                            'label': 'Hemangioma',
                            'ic': '6.065266844134485'
                        },
                        'HP:0000478': {
                            'label': 'Abnormality of the eye',
                            'ic': '2.380522773343265'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D013341',
                            'label': 'Sturge-Weber Syndrome'
                        },
                        '1': {
                            'id': 'D020752',
                            'label': 'Neurocutaneous Syndromes'
                        },
                        '2': {
                            'id': 'D001017',
                            'label': 'Aortic Coarctation'
                        },
                        '3': {
                            'id': 'D005124',
                            'label': 'Eye Abnormalities'
                        },
                        '4': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '5': {
                            'id': 'D019465',
                            'label': 'Craniofacial Abnormalities'
                        }
                    }
                },
                '56': {
                    'pmid': '21118628',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002748': {
                            'label': 'Rickets',
                            'ic': '7.471544935467813'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001596': {
                            'label': 'Alopecia',
                            'ic': '6.147169653181392'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '1': {
                            'id': 'D000505',
                            'label': 'Alopecia'
                        }
                    }
                },
                '57': {
                    'pmid': '23361946',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000717': {
                            'label': 'Autism',
                            'ic': '6.88269448109567'
                        },
                        'HP:0004482': {
                            'label': 'Relative macrocephaly',
                            'ic': '10.524657015421855'
                        },
                        'HP:0001548': {
                            'label': 'Overgrowth',
                            'ic': '6.502285952824843'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '58': {
                    'pmid': '21248748',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000490': {
                            'label': 'Deeply set eye',
                            'ic': '8.63956560640158'
                        },
                        'HP:0001317': {
                            'label': 'Abnormality of the cerebellum',
                            'ic': '5.1626846701188'
                        },
                        'HP:0000319': {
                            'label': 'Smooth philtrum',
                            'ic': '11.045191453314805'
                        },
                        'HP:0000582': {
                            'label': 'Upslanted palpebral fissure',
                            'ic': '10.370506335594596'
                        },
                        'HP:0000750': {
                            'label': 'Delayed speech and language development',
                            'ic': '7.781948705105482'
                        },
                        'HP:0001999': {
                            'label': 'Abnormal facial shape',
                            'ic': '6.6793003972983165'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000219': {
                            'label': 'Thin upper lip vermilion',
                            'ic': '10.322011985655985'
                        },
                        'HP:0000337': {
                            'label': 'Broad forehead',
                            'ic': '10.919311207425803'
                        },
                        'HP:0001270': {
                            'label': 'Motor delay',
                            'ic': '8.099469600335476'
                        },
                        'HP:0100783': {
                            'label': 'Breast aplasia',
                            'ic': '13.25468612324284'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D007805',
                            'label': 'Language Development Disorders'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '2': {
                            'id': 'D002872',
                            'label': 'Chromosome Deletion'
                        },
                        '3': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        }
                    }
                },
                '59': {
                    'pmid': '23160955',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000729': {
                            'label': 'Autistic behavior',
                            'ic': '6.547823786640093'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000252': {
                            'label': 'Microcephaly',
                            'ic': '7.248332963641107'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D020022',
                            'label': 'Genetic Predisposition to Disease'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '2': {
                            'id': 'D008831',
                            'label': 'Microcephaly'
                        }
                    }
                },
                '60': {
                    'pmid': '22821547',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000589': {
                            'label': 'Coloboma',
                            'ic': '8.171213505194318'
                        },
                        'HP:0001513': {
                            'label': 'Obesity',
                            'ic': '3.7945040117980566'
                        },
                        'HP:0001249': {
                            'label': 'Intellectual disability',
                            'ic': '5.272952836550954'
                        },
                        'HP:0001520': {
                            'label': 'Large for gestational age',
                            'ic': '7.604929718440271'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D008607',
                            'label': 'Intellectual Disability'
                        },
                        '1': {
                            'id': 'D005320',
                            'label': 'Fetal Macrosomia'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D009765',
                            'label': 'Obesity'
                        },
                        '4': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        },
                        '5': {
                            'id': 'D003103',
                            'label': 'Coloboma'
                        },
                        '6': {
                            'id': 'D019066',
                            'label': 'Facies'
                        }
                    }
                },
                '61': {
                    'pmid': '23794269',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000215': {
                            'label': 'Thick upper lip vermilion',
                            'ic': '10.623596963276759'
                        },
                        'HP:0000431': {
                            'label': 'Wide nasal bridge',
                            'ic': '9.517016504959471'
                        },
                        'HP:0000369': {
                            'label': 'Low-set ears',
                            'ic': '8.892295463085818'
                        },
                        'HP:0002194': {
                            'label': 'Delayed gross motor development',
                            'ic': '10.561561572357306'
                        },
                        'HP:0000411': {
                            'label': 'Protruding ear',
                            'ic': '9.66501331921235'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0002007': {
                            'label': 'Frontal bossing',
                            'ic': '9.655852949813687'
                        },
                        'HP:0000322': {
                            'label': 'Short philtrum',
                            'ic': '10.76977947345484'
                        },
                        'HP:0000316': {
                            'label': 'Hypertelorism',
                            'ic': '8.158212979977622'
                        },
                        'HP:0007206': {
                            'label': 'Hemimegalencephaly',
                            'ic': '9.86841439179736'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '1': {
                            'id': 'D008607',
                            'label': 'Intellectual Disability'
                        }
                    }
                },
                '62': {
                    'pmid': '22587682',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002654': {
                            'label': 'Multiple epiphyseal dysplasia',
                            'ic': '10.072013347038599'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D010009',
                            'label': 'Osteochondrodysplasias'
                        },
                        '1': {
                            'id': 'D019066',
                            'label': 'Facies'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '3': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        }
                    }
                },
                '63': {
                    'pmid': '21487377',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0003741': {
                            'label': 'Congenital muscular dystrophy',
                            'ic': '8.4625754346045'
                        },
                        'HP:0004481': {
                            'label': 'Progressive macrocephaly',
                            'ic': '11.408859432744508'
                        },
                        'HP:0003150': {
                            'label': 'Glutaric aciduria',
                            'ic': '9.725062952991863'
                        },
                        'HP:0002352': {
                            'label': 'Leukoencephalopathy',
                            'ic': '6.782339828741939'
                        },
                        'HP:0001355': {
                            'label': 'Megalencephaly',
                            'ic': '9.333813502537712'
                        },
                        'HP:0001298': {
                            'label': 'Encephalopathy',
                            'ic': '5.373168167455695'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D020279',
                            'label': 'Hereditary Central Nervous System Demyelinating Diseases'
                        },
                        '1': {
                            'id': 'D003560',
                            'label': 'Cysts'
                        },
                        '2': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '64': {
                    'pmid': '22327705',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0002119': {
                            'label': 'Ventriculomegaly',
                            'ic': '6.4139019513674835'
                        },
                        'HP:0002591': {
                            'label': 'Polyphagia',
                            'ic': '2.169065867918621'
                        },
                        'HP:0002586': {
                            'label': 'Peritonitis',
                            'ic': '4.465584613490862'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D018450',
                            'label': 'Disease Progression'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '65': {
                    'pmid': '22900024',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0002511': {
                            'label': 'Alzheimer disease',
                            'ic': '4.519071623884762'
                        },
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000708': {
                            'label': 'Behavioral abnormality',
                            'ic': '1.5759167072352744'
                        },
                        'HP:0000717': {
                            'label': 'Autism',
                            'ic': '6.88269448109567'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '66': {
                    'pmid': '21822956',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001067': {
                            'label': 'Neurofibromas',
                            'ic': '6.391231103157283'
                        },
                        'HP:0009734': {
                            'label': 'Optic glioma',
                            'ic': '8.777349308764633'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D009456',
                            'label': 'Neurofibromatosis 1'
                        },
                        '1': {
                            'id': 'D020339',
                            'label': 'Optic Nerve Glioma'
                        },
                        '2': {
                            'id': 'D014786',
                            'label': 'Vision Disorders'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '67': {
                    'pmid': '22455534',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0001520': {
                            'label': 'Large for gestational age',
                            'ic': '7.604929718440271'
                        },
                        'HP:0002591': {
                            'label': 'Polyphagia',
                            'ic': '2.169065867918621'
                        },
                        'HP:0000965': {
                            'label': 'Cutis marmorata',
                            'ic': '8.81990892318343'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D013684',
                            'label': 'Telangiectasis'
                        },
                        '1': {
                            'id': 'D017445',
                            'label': 'Skin Diseases, Vascular'
                        },
                        '2': {
                            'id': 'D005146',
                            'label': 'Facial Asymmetry'
                        },
                        '3': {
                            'id': 'D008310',
                            'label': 'Malocclusion'
                        },
                        '4': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '5': {
                            'id': 'D000015',
                            'label': 'Abnormalities, Multiple'
                        }
                    }
                },
                '68': {
                    'pmid': '21417916',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0006731': {
                            'label': 'Follicular thyroid carcinoma',
                            'ic': '8.531239196330375'
                        },
                        'HP:0002664': {
                            'label': 'Neoplasm',
                            'ic': '0.8645402153104755'
                        },
                        'HP:0100646': {
                            'label': 'Thyroiditis',
                            'ic': '4.373868855799664'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D013964',
                            'label': 'Thyroid Neoplasms'
                        },
                        '1': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '69': {
                    'pmid': '22841957',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0000717': {
                            'label': 'Autism',
                            'ic': '6.88269448109567'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '70': {
                    'pmid': '22269214',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0000256': {
                            'label': 'Macrocephaly',
                            'ic': '7.836119628543226'
                        },
                        'HP:0002591': {
                            'label': 'Polyphagia',
                            'ic': '2.169065867918621'
                        },
                        'HP:0007354': {
                            'label': 'Amyotrophic lateral sclerosis',
                            'ic': '4.470302724140585'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D030342',
                            'label': 'Genetic Diseases, Inborn'
                        },
                        '1': {
                            'id': 'D001927',
                            'label': 'Brain Diseases'
                        },
                        '2': {
                            'id': 'D008659',
                            'label': 'Metabolic Diseases'
                        },
                        '3': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        }
                    }
                },
                '71': {
                    'pmid': '22374812',
                    'title': 'Quantitative ultrasonography in focal neuropathies as compared to clinical and EMG findings',
                    'hpo': {
                        'HP:0001355': {
                            'label': 'Megalencephaly',
                            'ic': '9.333813502537712'
                        },
                        'HP:0002536': {
                            'label': 'Abnormal cortical gyration',
                            'ic': '8.039750365633854'
                        }
                    },
                    'mesh': {
                        '0': {
                            'id': 'D058627',
                            'label': 'Macrocephaly'
                        },
                        '1': {
                            'id': 'D013796',
                            'label': 'Thanatophoric Dysplasia'
                        }
                    }
                }
            });*/

        // }
    });
