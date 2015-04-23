(function() {
  'use strict';
  var module = angular.module('sourceSelection', [
    'regionSelection',
    'geolocator',
    'cookies',
  ]);

  module.directive('offerSourceSelection', ['$window',
    function($window) {
      return {
        scope: {
          onRegionSelected: '&',
          onLocationSelected: '&',
          state: '=?',
        },
        link: function($scope, $element, $attrs) {
          $scope.canSelectProximal = function() {
            return !!$window.navigator.geolocation;
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
          if (!$scope.state) {
            $scope.state = {};
          } else {
            $scope.state = {
              offerSource: $scope.state,
            };
          }
        },
        restrict: 'E',
        templateUrl: 'src/mainView/sourceSelection/offerSourceSelection.template.html',
      };
    }
  ]);
})();
