(function() {
  'use strict';
  var module = angular.module('sourceSelection', [
    'regionSelection',
    'geolocator',
    'cookies',
  ]);

  module.directive('offerSourceSelection', ['$window', 'cookies',
    function($window, cookies) {
      return {
        scope: {
          onRegionSelected: '&',
          onLocationSelected: '&',
          isLocationSelectionEnabled: '=',
        },
        link: function($scope, $element, $attrs) {
          $scope.canSelectProximal = function() {
            return !$window.navigator.geolocation;
          };
          $scope.regionSelected = function(region) {
            cookies.setOfferSource({
              region: region,
            });
            $scope.onRegionSelected({
              $region: region,
            });
          };
          $scope.locationSelected = function(lat, lng) {
            cookies.setOfferSource({
              location: true,
            });
            $scope.onLocationSelected({
              $lat: lat,
              $lng: lng,
            });
          };
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/sourceSelection/offerSourceSelection.template.html',
      };
    }
  ]);
})();
