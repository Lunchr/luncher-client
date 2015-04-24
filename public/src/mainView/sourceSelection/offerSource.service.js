(function() {
  'use strict';
  var module = angular.module('offerSource', [
    'cookies',
  ]);

  module.factory('offerSourceService', ['cookies',
    function(cookies) {
      var subedCallbacks = [];
      var offerSource = cookies.getOfferSource();

      function onChanged(callback) {
        subedCallbacks.push(callback);
      }
      function unsubscribe(callback) {
        var i = subedCallbacks.indexOf(callback);
        if (i != -1) {
          subedCallbacks.splice(i, 1);
        }
      }
      return {
        /**
         * @typedef {Object} OfferSourceService~OfferSource
         * @property {string} [region] The name of the selected region
         * @property {LatLng} [location] Coordinates of the selected location
         */

        /**
         * @callback OfferSourceService~stateChangeCallback
         * @param {OfferSourceService~OfferSource} offerSource The new offer source
         */

        /**
         * Registers the callback to be called whenever the offer source changes.
         * Also adds a listener for the $scope's $destroy event to unregister the
         * callback when the $scope is discarded.
         *
         * @param {Scope}   $scope
         * @param {OfferSourceService~stateChangeCallback} callback
         */
        subscribeToChanges: function($scope, callback) {
          onChanged(callback);
          $scope.$on('$destroy', function() {
            unsubscribe(callback);
          });
        },
        getCurrent: function() {
          return offerSource;
        },
        update: function(_offerSource_) {
          offerSource = _offerSource_;
          cookies.setOfferSource(offerSource);
          subedCallbacks.forEach(function(callback) {
            callback(offerSource);
          });
        },
      };
    }
  ]);
})();
