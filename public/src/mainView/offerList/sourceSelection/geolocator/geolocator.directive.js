(function() {
  'use strict';
  var module = angular.module('geolocator', ['ngGeolocator']);

  module.directive('geolocator', ['ngGeolocator',
    function(ngGeolocator) {
      return {
        scope: {
          key: '@',
          onLocationSelected: '&',
          ngShow: '=',
        },
        link: function($scope, $element, $attrs) {
          var locator;
          $scope.locationSelected = function() {
            var location = locator.getLocation();
            $scope.onLocationSelected({
              $lat: location.lat,
              $lng: location.lng,
            });
          };
          $scope.ready = false;
          var deregister = $scope.$watch('ngShow', function(newVal, oldVal) {
            if (!newVal) {
              return;
            }
            ngGeolocator.create('geolocator-canvas-'+$scope.$id, $scope.key).then(function(_locator_) {
              locator = _locator_;
              $scope.ready = true;
            });
            // only init the map the first time this directive is made visible
            deregister();
          });
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/sourceSelection/geolocator/geolocator.template.html',
      };
    }
  ]);


})();
