(function() {
  'use strict';
  var module = angular.module('regionSelection', [
    'ngResource',
  ]);

  module.directive('regionSelection', ['$resource', 'offerSourceService',
    function($resource, offerSourceService) {
      return {
        scope: {
          onSelected: '&',
        },
        controllerAs: 'ctrl',
        bindToController: true,
        controller: ['$scope',
          function($scope) {
            var ctrl = this;
            ctrl.regions = $resource('api/v1/regions', {}, {
              'queryCached': {
                method: 'GET',
                isArray: true,
                cache: true,
              }
            }).queryCached();
            ctrl.regionSelected = function() {
              offerSourceService.update({
                region: ctrl.selected
              });
              ctrl.onSelected();
            };
            function offerSourceChanged(offerSource) {
              ctrl.selected = offerSource.region;
            }
            offerSourceService.subscribeToChanges($scope, offerSourceChanged);
            offerSourceChanged(offerSourceService.getCurrent());
          }
        ],
        restrict: 'E',
        templateUrl: 'src/mainView/sourceSelection/regionSelection/regionSelection.template.html',
      };
    }
  ]);
})();
