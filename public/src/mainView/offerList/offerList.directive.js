(function() {
  'use strict';
  var module = angular.module('offerList', [
    'ngResource',
    'offerListControllers',
    'offerListFilters',
    'offerListSorters',
    'favorites',
    'offerSource',
    'commonFilters',
  ]);

  var PUBLIC_GOOGLE_MAPS_API_KEY = 'AIzaSyDf4MxGKR5Ejn6uDv3IjaNuqZcfO-ivyV8';

  module.directive('offerList', ['$resource', 'favorites', 'offerSourceService', 'offerFilterStateService',
    'offerOrderStateService', 'searchFilter', 'tagFilter', 'orderByFilter', 'orderFilter',
    function($resource, favorites, offerSourceService, offerFilterStateService, offerOrderStateService,
             searchFilter, tagFilter, orderByFilter, orderFilter) {
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
          ctrl.getStaticMap = function(restaurant) {
            var latLng = getLatLng(restaurant);
            var params = {
              center: latLng,
              zoom: 16,
              size: '750x200',
              scale: 2,
              markers: 'color:orange|' + latLng,
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
          offerFilterStateService.subscribeToChanges($scope, function filterChanged(filterState) {
            onOffersUpdated();
          });
          offerOrderStateService.subscribeToChanges($scope, function orderChanged(orderState) {
            onOffersUpdated();
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
            var offers = searchFilter(ctrl.offers);
            offers = tagFilter(offers);
            offers = orderByFilter(offers, 'restaurant.name');
            offers = orderFilter(offers);
            ctrl.offersByRestaurantByFavorite = groupOffers(offers);
            ctrl.hasOffers = ctrl.offersByRestaurantByFavorite.length > 0;
          }

          function groupOffers(offers) {
            if (!(offers instanceof Array)) {
              return [];
            }
            var favoriteOffers = [];
            var otherOffers = [];
            offers.forEach(function(offer) {
              if (offer.restaurant.isFavorite) {
                favoriteOffers.push(offer);
              } else {
                otherOffers.push(offer);
              }
            });
            var favoriteOffersByRestaurant = groupOffersByRestaurant(favoriteOffers);
            var otherOffersByRestaurant = groupOffersByRestaurant(otherOffers);

            var offersByRestaurantByFavorite = [];
            if (favoriteOffersByRestaurant.length > 0) {
              offersByRestaurantByFavorite.push(favoriteOffersByRestaurant);
            }
            if (otherOffersByRestaurant.length > 0) {
              offersByRestaurantByFavorite.push(otherOffersByRestaurant);
            }
            return offersByRestaurantByFavorite;
          }

          function groupOffersByRestaurant(offers) {
            var offersByRestaurant = [];
            for (var i = 0; i < offers.length; i++) {
              var offer = offers[i];
              if (isFirstForRestaurant(offers, i)) {
                var restaurant = offer.restaurant;
                restaurant.offers = [];
                offersByRestaurant.push(restaurant);
              }
              var lastRestaurant = offersByRestaurant[offersByRestaurant.length - 1];
              lastRestaurant.offers.push(offer);
            }
            return offersByRestaurant;
          }

          function isFirstForRestaurant(offers, i) {
            if (i === 0) return true;
            return offers[i - 1].restaurant.name != offers[i].restaurant.name;
          }

          function getLatLng(restaurant) {
            // offer.restaurant.location is a GeoJSON object. This means coordinates
            // is an array of [lng,lat]
            var coords = restaurant.location.coordinates;
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
