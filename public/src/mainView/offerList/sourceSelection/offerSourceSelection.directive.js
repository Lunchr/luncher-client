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
          onBootWithLocator: '&',
          onBootWithoutDefault: '&',
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

          var offerSource = cookies.getOfferSource();
          if (offerSource && offerSource.region){
            $scope.regionSelected(offerSource.region);
          } else if (offerSource && offerSource.location) {
            $scope.userWantsProximal = true;
            $scope.onBootWithLocator();
          } else {
            $scope.onBootWithoutDefault();
          }
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/sourceSelection/offerSourceSelection.template.html',
      };
    }
  ]);
})();
