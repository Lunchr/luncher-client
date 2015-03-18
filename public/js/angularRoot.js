(function() {
  'use strict';
  var praadApp = angular.module('praadApp', [
    'mainView',
    'restaurantAdminView',
    'commonFilters',
    'ngRoute',
    'i18nCustomizations',
  ]).config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/offers', {
        templateUrl: 'partials/mainView.html'
      }).
      when('/admin', {
        templateUrl: 'partials/restaurantAdminView.html',
        controller: 'RestaurantAdminViewCtrl'
      }).
      otherwise({
        redirectTo: '/offers'
      });
    }
  ]);
})();
