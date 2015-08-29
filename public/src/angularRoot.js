(function() {
  'use strict';
  var module = angular.module('app', [
    'mainViewController',
    'registerPages',
    'registerLogin',
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
      when('/register/login/:token', {
        templateUrl: 'src/register/login.template.html',
        controller: 'RegisterLoginCtrl',
        controllerAs: 'vm',
        resolve: {
          redirectURL: ['$http', '$route', '$q',
            function($http, $route, $q) {
              return $http.get('/api/v1/register/facebook', {
                token: $route.current.params.token,
              }).then(function success(resp) {
                return {
                  url: resp.data,
                };
              }, function error(resp) {
                if (resp.status === 403 || resp.status === 401) {
                  return {
                    error: resp.data,
                  };
                }
                return $q.reject(resp);
              });
            }
          ],
        }
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
                return $q.resolve();
              }
              return $resource('/api/v1/register/facebook/pages/:id').get({
                id: $route.current.params.pageID,
              }).$promise.catch(function(resp) {
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
