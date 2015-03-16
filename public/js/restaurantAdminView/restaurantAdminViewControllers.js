(function() {
  'use strict';
  var module = angular.module('restaurantAdminViewControllers', [
    'ngResource',
  ]);
  var offerPostedEventChannel = 'offer-posted';

  module.controller('RestaurantAdminViewCtrl', ['$scope', '$resource',
    function($scope, $resource) {
      $scope.restaurant = $resource('api/v1/restaurants/me').get();
      $scope.postOffer = function(offer) {
        offer.restaurant = $scope.restaurant;
        var postedOffer = $resource('api/v1/offers').save(offer);
        $scope.$broadcast(offerPostedEventChannel, postedOffer);
      };
    }
  ]);

  module.controller('RestaurantOfferListCtrl', ['$scope', '$resource',
    function($scope, $resource) {
      $scope.offers = $resource('api/v1/restaurants/me/offers').query();
      $scope.$on(offerPostedEventChannel, function(event, offer) {
        $scope.offers.unshift(offer);

        offer.confirmationPending = true;
        offer.$promise.then(function() {
          offer.confirmationPending = false;
        }, function() {
          // we could, in theory, use shift(), but I don't think we can guarantee at
          // this point that this offer is still the first one
          var index = $scope.offers.indexOf(offer);
          if (index > -1) {
            $scope.offers.splice(index, 1);
          }
        });
      });
    }
  ]);
})();
