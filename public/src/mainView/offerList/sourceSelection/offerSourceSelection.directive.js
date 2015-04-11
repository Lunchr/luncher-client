(function() {
  'use strict';
  var module = angular.module('sourceSelection', [
    'regionSelection',
  ]);

  module.directive('offerSourceSelection', [
    function() {
      return {
        scope: {
          onRegionSelected: '&',
        },
        link: function($scope, $element, $attrs) {
          $scope.regionSelected = function(region) {
            $scope.onRegionSelected({
              $region: region,
            });
          };
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/sourceSelection/offerSourceSelection.template.html',
      };
    }
  ]);
})();
