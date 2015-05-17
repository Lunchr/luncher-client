(function() {
  'use strict';
  var module = angular.module('offerList', [
    'ngResource',
    'offerListControllers',
    'favorites',
    'offerSource',
    'commonFilters',
  ]);

  var PUBLIC_GOOGLE_MAPS_API_KEY = 'AIzaSyDf4MxGKR5Ejn6uDv3IjaNuqZcfO-ivyV8';

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
            onFavoritesUpdated();
          };
          ctrl.isFirstForRestaurant = function(offers, offer) {
            var i = offers.indexOf(offer);
            if (i === 0) return true;
            return offers[i - 1].restaurant.name != offer.restaurant.name;
          };
          ctrl.isLastForRestaurant = function(offers, offer) {
            var i = offers.indexOf(offer);
            if (i === offers.length - 1) return true;
            return offers[i + 1].restaurant.name != offer.restaurant.name;
          };
          ctrl.getStaticMap = function(offer) {
            var latLng = getLatLng(offer);
            var params = {
              center: latLng,
              zoom: 17,
              size: '200x200',
              scale: 2,
              markers: 'color:red|' + latLng,
              key: PUBLIC_GOOGLE_MAPS_API_KEY,
            };
            var encodedParams = Object.keys(params).map(function(k) {
              return k + '=' + encodeURIComponent(params[k]);
            }).join('&');
            return 'https://maps.googleapis.com/maps/api/staticmap?' + encodedParams;
          };

          offerSourceService.subscribeToChanges($scope, function loadOffers(offerSource) {
            ctrl.offerSource = offerSource;
            if (offerSource.region) {
              loadOffersForRegion(offerSource.region);
            } else if (offerSource.location) {
              loadOffersNearLocation(offerSource.location);
            }
          });
          (function bootstrap() {
            var offerSource = offerSourceService.getCurrent();
            ctrl.offerSource = offerSource;
            if (offerSource && offerSource.region) {
              loadOffersForRegion(offerSource.region);
            }
          })();

          function loadOffersForRegion(region) {
            ctrl.offers = $resource('api/v1/regions/' + region + '/offers').query({},
              offerLoadSuccess, offerLoadError);
          }

          function loadOffersNearLocation(location) {
            ctrl.offers = $resource('api/v1/offers').query({
              lat: location.lat,
              lng: location.lng,
            }, offerLoadSuccess, offerLoadError);
          }

          function offerLoadSuccess() {
            onFavoritesUpdated();
          }

          function offerLoadError() {
            ctrl.offersGroupedByIsFavorite = [];
          }

          function onFavoritesUpdated() {
            favorites.decorateOffers(ctrl.offers);
            onOffersUpdated();
          }

          function onOffersUpdated() {
            ctrl.offersGroupedByIsFavorite = groupOffers();
            ctrl.hasOffers = ctrl.offersGroupedByIsFavorite.length > 0;
          }

          function groupOffers() {
            var favoriteOffers = ctrl.offers.filter(function(offer) {
              return offer.restaurant.isFavorite;
            });
            var otherOffers = ctrl.offers.filter(function(offer) {
              return !offer.restaurant.isFavorite;
            });
            var offersGroupedByIsFavorite = [];
            if (favoriteOffers.length > 0) {
              offersGroupedByIsFavorite.push(favoriteOffers);
            }
            if (otherOffers.length > 0) {
              offersGroupedByIsFavorite.push(otherOffers);
            }
            return offersGroupedByIsFavorite;
          }

          function getLatLng(offer) {
            // offer.restaurant.location is a GeoJSON object. This means coordinates
            // is an array of [lng,lat]
            var coords = offer.restaurant.location.coordinates;
            var lng = coords[0];
            var lat = coords[1];
            return lat + "," + lng;
          }
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/offerList.template.html',
      };
    }
  ]);

})();
