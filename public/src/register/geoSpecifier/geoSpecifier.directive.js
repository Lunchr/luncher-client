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
          register: '&',
        },
        controllerAs: 'ctrl',
        bindToController: true,
        controller: ['$scope', '$timeout', '$q', function($scope, $timeout, $q) {
          var ctrl = this;
          var specifierDeferred = $q.defer();
          var specifierPromise = specifierDeferred.promise;
          $timeout(function() {
            // wrap in $timeout to only load the map after the canvas has been
            // actually rendered
            specifierDeferred.resolve(geoSpecifierService.create('geo-specifier-canvas-' + $scope.$id));
          });
          specifierPromise.then(function success(specifier) {
            ctrl.register({
              $specifier: specifier,
            });
          }, function failure(message) {
            ctrl.error = true;
          });
          $scope.$watch(function() {
            return ctrl.address;
          }, function(newVal, oldVal) {
            if (!newVal) {
              return;
            }
            specifierPromise.then(function(specifier) {
              specifier.setAddress(ctrl.address, ctrl.region);
              if (!oldVal) {
                // if !oldVal then canvas will be hidden. Only after $timeout will
                // it be shown and rendered again.
                $timeout(specifier.onResized);
              }
            });
          });
        }],
        restrict: 'E',
        templateUrl: 'src/register/geoSpecifier/geoSpecifier.template.html',
      };
    }
  ]);
})();
