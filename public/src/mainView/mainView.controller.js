(function() {
  'use strict';
  var module = angular.module('mainViewController', [
    'ngResource',
    'offerListControllers',
    'favorites',
    'sourceSelection',
  ]);

  module.controller('MainViewCtrl', ['$scope', '$resource', 'favorites', 'cookies',
    function($scope, $resource, favorites, cookies) {
      $scope.loadOffersForRegion = function(region) {
        $scope.region = region;
        cookies.setOfferSource({
          region: region,
        });
        $scope.offers = $resource('api/v1/regions/'+region+'/offers').query({},
          offerLoadSuccess, offerLoadError);
      };
      $scope.loadOffersNearLocation = function(lat, lng) {
        delete $scope.region;
        cookies.setOfferSource({
          location: true,
        });
        $scope.offers = $resource('api/v1/offers').query({
          lat: lat,
          lng: lng,
        }, offerLoadSuccess, offerLoadError);
      };
      $scope.toggleFavorite = function(restaurantName) {
        favorites.toggleInclusion(restaurantName);
        updateFavorites();
      };
      $scope.getLatLng = function(offer) {
        // offer.restaurant.location is a GeoJSON object. This means coordinates
        // is an array of [lng,lat]
        var coords = offer.restaurant.location.coordinates;
        var lng = coords[0];
        var lat = coords[1];
        return lat+","+lng;
      };
      (function bootstrap(){
        if (!$scope.state) {
          $scope.state = {};
        }
        var offerSource = cookies.getOfferSource();
        if (offerSource) {
          $scope.state.offerSource = offerSource;
          if(offerSource.region){
            $scope.loadOffersForRegion(offerSource.region);
            return;
          } else if (offerSource.location) {
            $scope.state.sourceSelectionPopup = 'active';
            return;
          }
        }
        $scope.state.sourceSelectionPopup = 'active';
      })();

      function offerLoadSuccess() {
        updateFavorites();
      }
      function offerLoadError() {
        $scope.offersGroupedByIsFavorite = [];
      }
      function updateFavorites() {
        favorites.decorateOffers($scope.offers);
        var favoriteOffers = $scope.offers.filter(function(offer) {
          return offer.isFavorite;
        });
        var otherOffers = $scope.offers.filter(function(offer) {
          return !offer.isFavorite;
        });
        $scope.offersGroupedByIsFavorite = [];
        if (favoriteOffers.length > 0) {
          $scope.offersGroupedByIsFavorite.push(favoriteOffers);
        }
        if (otherOffers.length > 0) {
          $scope.offersGroupedByIsFavorite.push(otherOffers);
        }
      }
    }
  ]);
})();
