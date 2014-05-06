(function() {
  'use strict';
  var offerListControllers = angular.module('restaurantAdminViewControllers', [
    'ngResource'
  ]);

  offerListControllers.controller('RestaurantAdminViewCtrl', ['$scope', '$resource',
    function($scope, $resource) {
      $scope.restaurant = $resource('api/restaurant').get();
    }
  ]);

  offerListControllers.controller('RestaurantOfferListCtrl', ['$scope', '$resource',
    function($scope, $resource) {
      $scope.offers = $resource('api/offers', {
        restaurant: $scope.$parent.restaurant._id
      }).query();
    }
  ]);
})();
