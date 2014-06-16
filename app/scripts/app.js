'use strict';

/**
 * @ngdoc overview
 * @name skeletomePubmedAnnotatorApp
 * @description
 * # skeletomePubmedAnnotatorApp
 *
 * Main module of the application.
 */
angular.module('skeletomePubmedAnnotatorApp', ['ngRoute', 'restangular'])
    .config(function ($routeProvider, RestangularProvider) {

        RestangularProvider.setBaseUrl('api');

        $routeProvider.when('/annotation', {
            templateUrl: 'views/annotation.html',
            controller: 'AnnotationCtrl'
        });
        $routeProvider.when('/user-detail/:id', {
            templateUrl: 'partials/user-detail.html',
            controller: 'UserDetailCtrl'
        });
        $routeProvider.when('/user-creation', {
            templateUrl: 'partials/user-creation.html',
            controller: 'UserCreationCtrl'
        });
        $routeProvider.otherwise({
            redirectTo: '/annotation'
        });
    });