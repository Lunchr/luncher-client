(function() {
  'use strict';
  var module = angular.module('cookies', [
    'ipCookie',
  ]);

  module.constant('allCookies', {
    favorites: {
      name: 'luncher_favorites',
      expiry: 28, //days
    },
    offerSource: {
      name: 'luncher_offer_source',
      expiry: 28,
    },
  });

  module.factory('cookies', ['ipCookie', 'allCookies',
    function(ipCookie, allCookies) {
      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      var service = {
        refreshExpirations: function() {
          Object.keys(allCookies).forEach(function(key) {
            var cookieProps = allCookies[key];
            var cookie = ipCookie(cookieProps.name);
            if (cookie) {
              ipCookie(cookieProps.name, cookie, {expires: cookieProps.expiry});
            }
          });
        },
      };
      // create methods like setFavorites, getFavorites and removeFavorites
      Object.keys(allCookies).forEach(function(key) {
        var cookieProps = allCookies[key];
        var capitalizedKey = capitalizeFirstLetter(key);
        service['get' + capitalizedKey] = function(){
          return ipCookie(cookieProps.name);
        };
        service['set' + capitalizedKey] = function(val){
          // NB: ngCookies could be used after angular 1.4.x.
          // In the current version, however, there is no good way to set the expiry time
          return ipCookie(cookieProps.name, val, {expires: cookieProps.expiry});
        };
        service['remove' + capitalizedKey] = function(){
          return ipCookie.remove(cookieProps.name);
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
