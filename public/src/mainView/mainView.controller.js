(function() {
  'use strict';
  var module = angular.module('mainViewController', [
    'ngResource',
    'offerListControllers',
    'favorites',
    'sourceSelection',
  ]);

  module.controller('MainViewCtrl', ['$resource', 'favorites', 'cookies',
    function($resource, favorites, cookies) {
      var vm = this;
      vm.loadOffersForRegion = function(region) {
        var offerSource = {
          region: region,
        };
        cookies.setOfferSource(offerSource);
        vm.offerSource = offerSource;
        vm.offers = $resource('api/v1/regions/'+region+'/offers').query({},
          offerLoadSuccess, offerLoadError);
      };
      vm.loadOffersNearLocation = function(lat, lng) {
        var offerSource = {
          location: true,
        };
        cookies.setOfferSource(offerSource);
        vm.offerSource = offerSource;
        vm.offers = $resource('api/v1/offers').query({
          lat: lat,
          lng: lng,
        }, offerLoadSuccess, offerLoadError);
      };
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
      (function bootstrap(){
        if (!vm.state) {
          vm.state = {};
        }
        var offerSource = cookies.getOfferSource();
        if (offerSource) {
          if(offerSource.region){
            vm.loadOffersForRegion(offerSource.region);
            return;
          } else if (offerSource.location) {
            vm.offerSource = {
              location: true,
            };
            vm.state.sourceSelectionPopup = 'active';
            return;
          }
        }
        vm.state.sourceSelectionPopup = 'active';
      })();

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
