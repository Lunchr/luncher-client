(function() {
  'use strict';
  var module = angular.module('app', [
    'mainViewController',
    'restaurantAdminView',
    'commonFilters',
    'ngRoute',
    'i18nCustomizations',
  ]);

  module.config(['$routeProvider',
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
          restaurant: ['$resource', '$location',
            function ($resource, $location) {
              return $resource('/api/v1/restaurant').get().$promise.catch(function(resp) {
                if (resp.status === 403) {
                  $location.path('/login');
                }
              });
            }
          ],
        },
      }).
      when('/login', {
        redirectTo: function() {
          window.location.href = '/api/v1/login/facebook';
        },
      }).
      otherwise({
        redirectTo: '/offers',
      });
    }
  ]);
})();
