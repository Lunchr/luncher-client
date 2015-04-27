(function() {
  'use strict';
  var module = angular.module('restaurantAdminViewControllers', [
    'ngResource',
  ]);
  var offerPostedEventChannel = 'offer-posted';
  var offerUpdateOperation = {
    method: 'PUT',
    url: 'api/v1/offers/:id',
    params: {
      id: '@_id'
    },
  };
  var offerDeleteOperation = {
    method: 'DELETE',
    url: 'api/v1/offers/:id',
    params: {
      id: '@_id'
    },
  };

  module.controller('RestaurantAdminViewCtrl', ['$scope', '$resource', 'restaurant',
    function($scope, $resource, restaurant) {
      $scope.restaurant = restaurant;
      $scope.postOffer = function(offer) {
        offer.restaurant = $scope.restaurant;
        var postedOffer = $resource('api/v1/offers', {}, {
          update: offerUpdateOperation,
          delete: offerDeleteOperation,
        }).save(offer);
        $scope.$broadcast(offerPostedEventChannel, postedOffer);
      };
    }
  ]);

  module.controller('RestaurantOfferListCtrl', ['$scope', '$resource', '$window',
    function($scope, $resource, $window) {
      $scope.offers = $resource('api/v1/restaurant/offers', {}, {
        update: offerUpdateOperation,
        delete: offerDeleteOperation,
      }).query();
      $scope.updateOffer = function(currentOffer, offer) {
        offer.confirmationPending = true;
        var index = $scope.offers.indexOf(currentOffer);
        if (index > -1) {
          $scope.offers[index] = offer;
        }
        offer.$update({}, function success() {
          offer.confirmationPending = false;
        }, function error() {
          // Put back the previous version if the update fails
          var index = $scope.offers.indexOf(offer);
          if (index > -1) {
            $scope.offers[index] = currentOffer;
          }
        });

      };
      $scope.deleteOffer = function(offer) {
        var confirmed = $window.confirm('Oled sa kindel et sa tahad kustutada pakkumise "'+offer.title+'"?');
        if (!confirmed) return;
        offer.confirmationPending = true;
        offer.$delete({}, function success() {
          var index = $scope.offers.indexOf(offer);
          if (index > -1) {
            $scope.offers.splice(index, 1);
          }
        }, function error(resp) {
          offer.confirmationPending = false;
          offer.hasWarning = true;
        });
      };
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
