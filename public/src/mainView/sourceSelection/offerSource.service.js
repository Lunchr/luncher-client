(function() {
  'use strict';
  var module = angular.module('offerSource', [
    'cookies',
    'pubSub',
  ]);

  module.factory('offerSourceService', ['cookies', 'PubSub',
    function(cookies, PubSub) {
      return new PubSub(function getter() {
        return cookies.getOfferSource();
      }, function setter(offerSource) {
        /**
         * @typedef {Object} OfferSourceService~OfferSource
         * @property {string} [region] The name of the selected region
         * @property {LatLng} [location] Coordinates of the selected location
         */
        cookies.setOfferSource(offerSource);
      });
    }
  ]);
})();
