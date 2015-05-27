(function() {
  'use strict';
  var module = angular.module('cookies', [
    'ngCookies',
  ]);

  module.constant('allCookies', {
    favorites: {
      name: 'luncher_favorites',
      expiryInDays: 28, //days
    },
    offerSource: {
      name: 'luncher_offer_source',
      expiryInDays: 28,
    },
    filterState: {
      name: 'luncher_filters',
      expiryInDays: 28,
    },
  });

  module.factory('cookies', ['$cookies', 'allCookies',
    function($cookies, allCookies) {
      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      /**
       * @param  {Number} days
       * @return {Date}   A date the specified amount of days from now (discards the time component)
       */
      function daysFromNow(days) {
        var now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
      }

      function putCookie(cookieProps, cookie) {
        var expires = daysFromNow(cookieProps.expiryInDays);
        $cookies.putObject(cookieProps.name, cookie, {expires: expires});
      }

      var service = {
        refreshExpirations: function() {
          Object.keys(allCookies).forEach(function(key) {
            var cookieProps = allCookies[key];
            var cookie = $cookies.getObject(cookieProps.name);
            if (cookie) {
              putCookie(cookieProps, cookie);
            }
          });
        },
      };
      // create methods like setFavorites, getFavorites and removeFavorites
      Object.keys(allCookies).forEach(function(key) {
        var cookieProps = allCookies[key];
        var capitalizedKey = capitalizeFirstLetter(key);
        service['get' + capitalizedKey] = function(){
          return $cookies.getObject(cookieProps.name);
        };
        service['set' + capitalizedKey] = function(val){
          putCookie(cookieProps, val);
        };
        service['remove' + capitalizedKey] = function(){
          return $cookies.remove(cookieProps.name);
        };
      });
      return service;
    }
  ]);
  module.run(['cookies',
    function(cookies) {
      cookies.refreshExpirations();
    }
  ]);
})();
