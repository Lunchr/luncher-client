(function() {
  'use strict';
  var module = angular.module('geolocator', ['ngGeolocator']);

  module.directive('geolocator', ['ngGeolocator', 'offerSourceService',
    function(ngGeolocator, offerSourceService) {
      return {
        scope: {
          key: '@',
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
            ngGeolocator.create('geolocator-canvas-'+$scope.$id, ctrl.key).then(function(locator) {
              ctrl.locator = locator;
              ctrl.ready = true;
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
