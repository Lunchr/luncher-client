(function() {
  'use strict';
  var module = angular.module('app', [
    'mainViewController',
    'registerPages',
    'registerForm',
    'restaurantAdminView',
    'commonFilters',
    'ngResource',
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
        controllerAs: 'vm',
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
      when('/register', {
        redirectTo: '/register/login',
      }).
      when('/register/login', {
        templateUrl: 'src/register/login.template.html',
      }).
      when('/register/pages', {
        templateUrl: 'src/register/pages.template.html',
        controller: 'RegisterPagesCtrl',
        controllerAs: 'vm',
        resolve: {
          pages: ['$resource',
            function($resource) {
              return $resource('/api/v1/register/facebook/pages').query().$promise.catch(function(resp) {
                if (resp.status === 403) {
                  $location.path('/register/login');
                }
              });
            }
          ],
        },
      }).
      when('/register/form/:pageID?', {
        templateUrl: 'src/register/form.template.html',
        controller: 'RegisterFormCtrl',
        controllerAs: 'vm',
        resolve: {
          page: ['$resource', '$route', '$q',
            function($resource, $route, $q) {
              if (!$route.current.params.pageID) {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
              }
              var params = {
                id: $route.current.params.pageID,
              };
              return $resource('/api/v1/register/facebook/pages/:id').get(params).$promise.catch(function(resp) {
                if (resp.status === 403) {
                  $location.path('/register/login');
                }
              });
            }
          ],
        }
      }).
      otherwise({
        redirectTo: '/',
      });
    }
  ]);
})();
