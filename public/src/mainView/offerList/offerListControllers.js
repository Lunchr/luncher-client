(function() {
  'use strict';
  var module = angular.module('offerListControllers', [
    'ngResource',
    'offerListFilters',
    'offerListSorters',
    'favorites',
    'sourceSelection',
  ]);

  module.controller('OfferListCtrl', ['$scope', '$resource', 'favorites', 'cookies',
    function($scope, $resource, favorites, cookies) {
      $scope.loadOffersForRegion = function(region) {
        $scope.region = region;
        $scope.offers = $resource('api/v1/regions/'+region+'/offers').query({},
          offerLoadSuccess, offerLoadError);
      };
      $scope.loadOffersNearLocation = function(lat, lng) {
        delete $scope.region;
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
        var offerSource = cookies.getOfferSource();
        if (offerSource && offerSource.region){
          $scope.loadOffersForRegion(offerSource.region);
        } else if (offerSource && offerSource.location) {
          if (!$scope.state) {
            $scope.state = {};
          }
          $scope.state.sourceSelectionPopup = 'active';
          $scope.state.isLocationSelectionEnabled = true;
        } else {
          if (!$scope.state) {
            $scope.state = {};
          }
          $scope.state.sourceSelectionPopup = 'active';
        }
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

  module.controller('TagListCtrl', ['$scope', 'offerFilterState', '$resource',
    function($scope, offerFilterState, $resource) {
      $scope.tagList = $resource('api/v1/tags').query();

      $scope.$watch('tagList', function(tagList) {
        offerFilterState.selectedTags = [];
        tagList.forEach(function(tag) {
          if (tag.selected) {
            offerFilterState.selectedTags.push(tag.name);
          }
        });
      }, true);
    }
  ]);

  module.controller('SearchCtrl', ['$scope', 'offerFilterState',
    function($scope, offerFilterState) {
      $scope.$watch('query', function(query) {
        offerFilterState.query = query;
      }, true);
    }
  ]);
})();