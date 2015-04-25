(function() {
  'use strict';
  var praadApp = angular.module('praadApp', [
    'mainViewController',
    'restaurantAdminView',
    'commonFilters',
    'ngRoute',
    'i18nCustomizations',
  ]).config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/offers', {
        templateUrl: 'src/mainView/mainView.html',
        controller: 'MainViewCtrl',
        controllerAs: 'vm',
      }).
      when('/admin', {
        templateUrl: 'src/restaurantAdminView/restaurantAdminView.html',
        controller: 'RestaurantAdminViewCtrl',
        resolve: {
          restaurant: ['$resource',
            function ($resource) {
              return $resource('api/v1/restaurant').get();
            }
          ],
        },
        redirectTo: function() {
          window.location = '/api/v1/login/facebook';
        },
      }).
      otherwise({
        redirectTo: '/offers',
      });
    }
  ]);
})();
