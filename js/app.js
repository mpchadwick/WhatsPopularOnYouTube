'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
])

.config(function ($routeProvider, $sceDelegateProvider) {
    
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://www.youtube.com/**',
    'http://i1.ytimg.com/**',
    'http://api.wordnik.com:80/**'
  ]);

  $routeProvider.when('/', {
  	controller: 'MainCtrl',
    templateUrl: 'partials/partial1.html'
  }).otherwise({
  	redirectTo: '/'
  })

});
