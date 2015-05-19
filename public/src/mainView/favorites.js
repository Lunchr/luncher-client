(function() {
  'use strict';
  var module = angular.module('favorites', [
    'cookies',
  ]);

  module.factory('favorites', ['cookies',
    function(cookies) {
      var toggleArrayInclusion = function(arr, obj){
        if (!arr) {
          return [obj];
        }
        var index = arr.indexOf(obj);
        if (index > -1) {
          return arr.slice(0, index).concat(arr.slice(index + 1));
        }
        return arr.concat(obj);
      };

      return {
        toggleInclusion: function(restaurantName) {
          var favorites = cookies.getFavorites();
          var newFavorites = toggleArrayInclusion(favorites, restaurantName);
          if (newFavorites.length === 0) {
            cookies.removeFavorites();
            return;
          }
          cookies.setFavorites(newFavorites);
        },
        decorateOffers: function(offers) {
          var favorites = cookies.getFavorites();
          if (!favorites) {
            offers.forEach(function(offer) {
              offer.restaurant.isFavorite = false;
            });
            return;
          }
          offers.forEach(function(offer) {
            if (offer.restaurant) {
              offer.restaurant.isFavorite = favorites.indexOf(offer.restaurant.name) > -1;
            }
          });
        },
      };
    }
  ]);
})();
