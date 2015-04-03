(function() {
  'use strict';
  var module = angular.module('favorites', [
    'ipCookie',
  ]);

  module.factory('favorites', ['ipCookie',
    function(ipCookie) {
      // 28 days seems reasonable
      var COOKIE_EXPIRES_DAYS = 28;
      var FAVORITES_COOKIE = 'luncher_favorites';

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
        refreshCookieExpirations: function() {
          var favorites = ipCookie(FAVORITES_COOKIE);
          if (favorites) {
            ipCookie(FAVORITES_COOKIE, favorites, {expires: COOKIE_EXPIRES_DAYS});
          }
        },
        toggleInclusion: function(restaurantName) {
          // NB: ngCookies could be used after angular 1.4.x.
          // In the current version, however, there is no good way to set the expiry time
          var favorites = ipCookie(FAVORITES_COOKIE);
          var newFavorites = toggleArrayInclusion(favorites, restaurantName);
          if (newFavorites.length === 0) {
            ipCookie.remove(FAVORITES_COOKIE);
            return;
          }
          ipCookie(FAVORITES_COOKIE, newFavorites, {expires: COOKIE_EXPIRES_DAYS});
        },
        decorateOffers: function(offers) {
          var favorites = ipCookie(FAVORITES_COOKIE);
          if (!favorites) {
            offers.forEach(function(offer) {
              offer.isFavorite = false;
            });
            return;
          }
          offers.forEach(function(offer) {
            if (offer.restaurant) {
              offer.isFavorite = favorites.indexOf(offer.restaurant.name) > -1;
            }
          });
        },
      };
    }
  ]);
  module.run(['favorites',
    function(favorites) {
      favorites.refreshCookieExpirations();
    }
  ]);
})();
