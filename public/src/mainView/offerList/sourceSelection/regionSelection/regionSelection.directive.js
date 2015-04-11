(function() {
  'use strict';
  var module = angular.module('regionSelection', []);

  module.directive('regionSelection', ['$resource',
    function($resource) {
      return {
        scope: {
          onRegionSelected: '&',
        },
        link: function($scope, $element, $attrs) {
          $scope.regions = $resource('api/v1/regions', {}, {
            'queryCached': {
              method: 'GET',
              isArray: true,
              cache: true,
            }
          }).queryCached();
          $scope.$watch('selectedRegion', function(newVal, oldVal) {
            if (newVal === oldVal) {
              return;
            }
            $scope.onRegionSelected({
              region: newVal,
            });
          });
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/sourceSelection/regionSelection/regionSelection.template.html',
      };
    }
  ]);
})();
