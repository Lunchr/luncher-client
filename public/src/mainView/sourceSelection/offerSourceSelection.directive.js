(function() {
  'use strict';
  var module = angular.module('sourceSelection', [
    'regionSelection',
    'geolocator',
    'offerSource',
  ]);

  module.directive('offerSourceSelection', ['$window', 'offerSourceService',
    function($window, offerSourceService) {
      return {
        scope: {
          onSelected: '&',
          onCancel: '&',
        },
        controllerAs: 'ctrl',
        bindToController: true,
        controller: ['$scope',
          function($scope) {
            var ctrl = this;
            ctrl.canSelectProximal = function() {
              return !!$window.navigator.geolocation;
            };
            function offerSourceChanged(offerSource) {
              ctrl.locationSelected = offerSource && !!offerSource.location;
            }
            offerSourceService.subscribeToChanges($scope, offerSourceChanged);
            offerSourceChanged(offerSourceService.getCurrent());
          }
        ],
        restrict: 'E',
        templateUrl: 'src/mainView/sourceSelection/offerSourceSelection.template.html',
      };
    }
  ]);
})();
