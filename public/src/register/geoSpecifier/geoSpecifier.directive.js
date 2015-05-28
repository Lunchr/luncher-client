(function() {
  'use strict';
  var module = angular.module('geoSpecifier', [
    'geoSpecifierService',
  ]);

  module.directive('geoSpecifier', ['geoSpecifierService',
    function(geoSpecifierService) {
      return {
        scope: {
          address: '=',
          region: '=',
        },
        controllerAs: 'ctrl',
        bindToController: true,
        controller: ['$scope', function($scope) {
          var ctrl = this;
          ctrl.locationSelected = function() {
            var location = ctrl.locator.getLocation();
            console.log(location);
          };

          ctrl.ready = false;
          geoSpecifierService.create('geo-specifier-canvas-' + $scope.$id, ctrl.address, ctrl.region).then(function success(locator) {
            ctrl.locator = locator;
            ctrl.ready = true;
          }, function failure(message) {
            ctrl.error = true;
          });
        }],
        restrict: 'E',
        templateUrl: 'src/register/geoSpecifier/geoSpecifier.template.html',
      };
    }
  ]);
})();
