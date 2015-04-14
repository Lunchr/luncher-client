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
          // The selected region will be bound to a property on this object. This
          // is required because each radio button in ng-repeat has its own scope
          // and without an explicit element in the parent they would all see a
          // different region as the selected one.
          $scope.selected = {};
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/sourceSelection/regionSelection/regionSelection.template.html',
        replace: true,
      };
    }
  ]);
})();
