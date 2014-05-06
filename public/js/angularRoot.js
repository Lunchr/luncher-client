(function() {
  'use strict';
  var praadApp = angular.module('praadApp', [
    'mainView',
    'restaurantAdminView',
    'ngRoute'
  ]).config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/offers', {
        templateUrl: 'partials/mainView.html'
      }).
      otherwise({
        redirectTo: '/offers'
      });
    }
  ]);
})();
