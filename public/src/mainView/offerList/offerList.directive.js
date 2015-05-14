(function() {
  'use strict';
  var module = angular.module('offerList', [
    'ngResource',
    'offerListControllers',
    'favorites',
    'offerSource',
    'commonFilters',
  ]);

  module.directive('offerList', ['$resource', 'favorites', 'offerSourceService',
    function($resource, favorites, offerSourceService) {
      return {
        scope: {
          hasOffers: '=?',
        },
        controllerAs: 'ctrl',
        bindToController: true,
        controller: function($scope) {
          var ctrl = this;
          ctrl.toggleFavorite = function(restaurantName) {
            favorites.toggleInclusion(restaurantName);
            updateFavorites();
          };
          ctrl.getLatLng = function(offer) {
            // offer.restaurant.location is a GeoJSON object. This means coordinates
            // is an array of [lng,lat]
            var coords = offer.restaurant.location.coordinates;
            var lng = coords[0];
            var lat = coords[1];
            return lat+","+lng;
          };
          ctrl.isFirstForRestaurant = function(offers, offer) {
            var i = offers.indexOf(offer);
            if (i === 0) return true;
            return offers[i-1].restaurant.name != offer.restaurant.name;
          };
          ctrl.isLastForRestaurant = function(offers, offer) {
            var i = offers.indexOf(offer);
            if (i === offers.length - 1) return true;
            return offers[i+1].restaurant.name != offer.restaurant.name;
          };

          offerSourceService.subscribeToChanges($scope, function loadOffers(offerSource) {
            ctrl.offerSource = offerSource;
            if (offerSource.region) {
              loadOffersForRegion(offerSource.region);
            } else if (offerSource.location) {
              loadOffersNearLocation(offerSource.location);
            }
          });
          (function bootstrap(){
            var offerSource = offerSourceService.getCurrent();
            ctrl.offerSource = offerSource;
            if (offerSource && offerSource.region) {
              loadOffersForRegion(offerSource.region);
            }
          })();

          function loadOffersForRegion(region) {
            ctrl.offers = $resource('api/v1/regions/'+region+'/offers').query({},
              offerLoadSuccess, offerLoadError);
          }
          function loadOffersNearLocation(location) {
            ctrl.offers = $resource('api/v1/offers').query({
              lat: location.lat,
              lng: location.lng,
            }, offerLoadSuccess, offerLoadError);
          }
          function offerLoadSuccess() {
            updateFavorites();
          }
          function offerLoadError() {
            ctrl.offersGroupedByIsFavorite = [];
          }
          function updateFavorites() {
            favorites.decorateOffers(ctrl.offers);
            var favoriteOffers = ctrl.offers.filter(function(offer) {
              return offer.restaurant.isFavorite;
            });
            var otherOffers = ctrl.offers.filter(function(offer) {
              return !offer.restaurant.isFavorite;
            });
            ctrl.offersGroupedByIsFavorite = [];
            if (favoriteOffers.length > 0) {
              ctrl.offersGroupedByIsFavorite.push(favoriteOffers);
            }
            if (otherOffers.length > 0) {
              ctrl.offersGroupedByIsFavorite.push(otherOffers);
            }
            ctrl.hasOffers = ctrl.offersGroupedByIsFavorite.length > 0;
          }
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/offerList.template.html',
      };
    }
  ]);

})();
