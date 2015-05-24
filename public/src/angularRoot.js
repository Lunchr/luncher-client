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
      when('/', {
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
        templateUrl: 'src/login.template.html',
      }).
      when('/faq', {
        templateUrl: 'src/faq.template.html',
      }).
      otherwise({
        redirectTo: '/',
      });
    }
  ]);
})();
