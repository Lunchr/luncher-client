(function() {
  'use strict';
  var offerListControllers = angular.module('restaurantAdminViewControllers', [
    'ngResource'
  ]);

  offerListControllers.controller('RestaurantAdminViewCtrl', ['$scope', '$resource',
    function($scope, $resource) {
      $scope.restaurant = $resource('api/v1/restaurant').get();
    }
  ]);

  offerListControllers.controller('RestaurantOfferListCtrl', ['$scope', '$resource',
    function($scope, $resource) {
      $scope.offers = $resource('api/v1/restaurant/offers').query();
    }
  ]);
})();
