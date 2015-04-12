(function() {
  'use strict';
  var praadApp = angular.module('praadApp', [
    'offerListControllers',
    'restaurantAdminView',
    'commonFilters',
    'ngRoute',
    'i18nCustomizations',
  ]).config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/offers', {
        templateUrl: 'src/mainView/mainView.html',
        controller: 'OfferListCtrl',
      }).
      when('/admin', {
        templateUrl: 'src/restaurantAdminView/restaurantAdminView.html',
        controller: 'RestaurantAdminViewCtrl',
      }).
      otherwise({
        redirectTo: '/offers',
      });
    }
  ]);
})();
