(function() {
  'use strict';
  var module = angular.module('geolocator', ['ngGeolocator', 'offerSource']);

  module.config(['ngGeolocatorProvider', function(ngGeolocatorProvider) {
    ngGeolocatorProvider.setGoogleMapsAPIKey('AIzaSyDf4MxGKR5Ejn6uDv3IjaNuqZcfO-ivyV8');
  }]);

  module.directive('geolocator', ['$timeout', 'ngGeolocator', 'offerSourceService',
    function($timeout, ngGeolocator, offerSourceService) {
      return {
        scope: {
          onSelected: '&',
          ngShow: '=',
        },
        controllerAs: 'ctrl',
        bindToController: true,
        controller: function() {
          var ctrl = this;
          ctrl.ready = false;
          ctrl.locationSelected = function() {
            var location = ctrl.locator.getLocation();
            offerSourceService.update({
              location: {
                lat: location.lat,
                lng: location.lng,
              },
            });
            ctrl.onSelected();
          };
        },
        link: function($scope, $element, $attrs, ctrl) {
          var deregister = $scope.$watch(function() {
            return ctrl.ngShow;
          }, function(newVal, oldVal) {
            if (!newVal) {
              return;
            }
            // The small timeout is used as a hacky fix to an issue where, if the Google Maps API
            // is already loaded, the initialization is almost instant and finishes before the
            // ngShow animation does. This means that the map will be initialized for a zero sized
            // canvas which messes things up. The timeout hack avoids this. I tried looking for a
            // way to listen to when the animation finishes, but didn't find anything good. Initializing
            // this with a callback after the animation would be a much nicer fix, though.
            $timeout(function() {
              ngGeolocator.create('geolocator-canvas-'+$scope.$id).then(function(locator) {
                ctrl.locator = locator;
                ctrl.ready = true;
              });
            }, 10);
            // only init the map the first time this directive is made visible
            deregister();
          });
        },
        restrict: 'E',
        templateUrl: 'src/mainView/sourceSelection/geolocator/geolocator.template.html',
      };
    }
  ]);


})();
