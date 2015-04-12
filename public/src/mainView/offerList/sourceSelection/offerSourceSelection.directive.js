(function() {
  'use strict';
  var module = angular.module('sourceSelection', [
    'regionSelection',
    'geolocator',
  ]);

  module.directive('offerSourceSelection', ['$window',
    function($window) {
      return {
        scope: {
          onRegionSelected: '&',
          onLocationSelected: '&',
        },
        link: function($scope, $element, $attrs) {
          $scope.canSelectProximal = function() {
            return !$window.navigator.geolocation;
          };
          $scope.regionSelected = function(region) {
            $scope.onRegionSelected({
              $region: region,
            });
          };
          $scope.locationSelected = function(lat, lng) {
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
