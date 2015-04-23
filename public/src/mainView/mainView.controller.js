(function() {
  'use strict';
  var module = angular.module('mainViewController', [
    'ngResource',
    'offerListControllers',
    'favorites',
    'offerSource',
    'sourceSelection',
  ]);

  module.controller('MainViewCtrl', ['$scope', '$resource', 'favorites', 'offerSourceService',
    function($scope, $resource, favorites, offerSourceService) {
      var vm = this;
      vm.toggleFavorite = function(restaurantName) {
        favorites.toggleInclusion(restaurantName);
        updateFavorites();
      };
      vm.getLatLng = function(offer) {
        // offer.restaurant.location is a GeoJSON object. This means coordinates
        // is an array of [lng,lat]
        var coords = offer.restaurant.location.coordinates;
        var lng = coords[0];
        var lat = coords[1];
        return lat+","+lng;
      };

      offerSourceService.subscribeToChanges($scope, function loadOffers(offerSource) {
        vm.offerSource = offerSource;
        if (offerSource.region) {
          loadOffersForRegion(offerSource.region);
        } else if (offerSource.location) {
          loadOffersNearLocation(offerSource.location);
        }
      });
      (function bootstrap(){
        if (!vm.state) {
          vm.state = {};
        }
        var offerSource = offerSourceService.getCurrent();
        vm.offerSource = offerSource;
        if (offerSource && offerSource.region) {
          loadOffersForRegion(offerSource.region);
        } else {
          vm.state.sourceSelectionPopup = 'active';
        }
      })();

      function loadOffersForRegion(region) {
        vm.offers = $resource('api/v1/regions/'+region+'/offers').query({},
          offerLoadSuccess, offerLoadError);
      }
      function loadOffersNearLocation(location) {
        vm.offers = $resource('api/v1/offers').query({
          lat: location.lat,
          lng: location.lng,
        }, offerLoadSuccess, offerLoadError);
      }
      function offerLoadSuccess() {
        updateFavorites();
      }
      function offerLoadError() {
        vm.offersGroupedByIsFavorite = [];
      }
      function updateFavorites() {
        favorites.decorateOffers(vm.offers);
        var favoriteOffers = vm.offers.filter(function(offer) {
          return offer.isFavorite;
        });
        var otherOffers = vm.offers.filter(function(offer) {
          return !offer.isFavorite;
        });
        vm.offersGroupedByIsFavorite = [];
        if (favoriteOffers.length > 0) {
          vm.offersGroupedByIsFavorite.push(favoriteOffers);
        }
        if (otherOffers.length > 0) {
          vm.offersGroupedByIsFavorite.push(otherOffers);
        }
      }
    }
  ]);
})();
