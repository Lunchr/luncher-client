(function() {
  'use strict';
  var module = angular.module('regionSelection', [
    'ngResource',
  ]);

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
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/sourceSelection/regionSelection/regionSelection.template.html',
        replace: true,
      };
    }
  ]);
})();
