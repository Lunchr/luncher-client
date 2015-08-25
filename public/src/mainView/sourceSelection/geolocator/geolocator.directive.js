(function() {
  'use strict';
  var module = angular.module('geolocator', [
    'ngGeolocator',
    'offerSource',
    'apiKeys',
  ]);

  module.config(['ngGeolocatorProvider', 'googleMapsAPIKey',
    function(ngGeolocatorProvider, googleMapsAPIKey) {
      ngGeolocatorProvider.setGoogleMapsAPIKey(googleMapsAPIKey);
      ngGeolocatorProvider.extendLocatorMarkerOptions({
        icon: {
          // url: '/img/geolocator-pointer.svg', - removed becaose of issues in firefox & IE
        },
      });
      ngGeolocatorProvider.extendStaticMarkerOptions({
        opacity: 0,
      });
      ngGeolocatorProvider.extendStaticCircleOptions({
        fillOpacity: 0.1,
        strokeOpacity: 0,
      });
    }
  ]);

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
            // $timeout forces the function to be called after the modified DOM
            // has been rendered by the browser and as we are just making the canvas
            // visible, we want to wait until it has actually been rendered otherwise
            // we get an error from the Google Maps API.
            $timeout(function() {
              ngGeolocator.create('geolocator-canvas-' + $scope.$id).then(function success(locator) {
                ctrl.locator = locator;
                ctrl.ready = true;
              }, function failure(message) {
                ctrl.error = true;
              });
            });
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
