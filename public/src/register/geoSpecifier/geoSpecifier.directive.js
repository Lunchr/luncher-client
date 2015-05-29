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
          var specifier;
          ctrl.ready = false;
          geoSpecifierService.create('geo-specifier-canvas-' + $scope.$id, ctrl.address, ctrl.region).then(function success(_specifier_) {
            specifier = _specifier_;
            ctrl.ready = true;
          }, function failure(message) {
            ctrl.error = true;
          });
          $scope.$watch(function() {
            return ctrl.address;
          }, function(newVal, oldVal) {
            if (!newVal || !ctrl.ready || newVal === oldVal) {
              return;
            }
            specifier.setAddress(ctrl.address, ctrl.region);
          });
        }],
        restrict: 'E',
        templateUrl: 'src/register/geoSpecifier/geoSpecifier.template.html',
      };
    }
  ]);
})();
