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
        templateUrl: 'src/mainView/mainView.html'
      }).
      when('/admin', {
        templateUrl: 'src/restaurantAdminView/restaurantAdminView.html',
        controller: 'RestaurantAdminViewCtrl'
      }).
      otherwise({
        redirectTo: '/offers'
      });
    }
  ]);
})();
