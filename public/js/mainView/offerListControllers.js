(function() {
  'use strict';
  var module = angular.module('offerListControllers', [
    'ngResource',
    'offerListFilters',
    'offerListSorters',
    'favorites',
  ]);

  module.controller('OfferListCtrl', ['$scope', '$resource', 'favorites',
    function($scope, $resource, favorites) {
      $scope.offers = $resource('api/v1/regions/tartu/offers').query({}, function success() {
        favorites.decorateOffers($scope.offers);
      });
      $scope.toggleFavorite = function(restaurantName) {
        favorites.toggleInclusion(restaurantName);
        favorites.decorateOffers($scope.offers);
      };
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
