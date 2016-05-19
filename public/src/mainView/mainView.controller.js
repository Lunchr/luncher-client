(function() {
  'use strict';
  var module = angular.module('mainViewController', [
    'ngResource',
    'offerListControllers',
    'favorites',
    'offerList',
    'offerSource',
    'sourceSelection',
  ]);

  var TALLINN = 'Tallinn';

  module.controller('MainViewCtrl', ['$scope', '$resource', 'offerSourceService',
    function($scope, $resource, offerSourceService) {
      var vm = this;
      if (!vm.state) {
        vm.state = {};
      }
      var offerSource = offerSourceService.getCurrent();
      vm.offerSource = offerSource;
      offerSourceService.subscribeToChanges($scope, function loadOffers(offerSource) {
        vm.offerSource = offerSource;
      });

      var openSourceSelection = function() {
        vm.state.sourceSelectionPopup = 'active';
      };
      var selectTallinn = function() {
        offerSourceService.update({
          region: TALLINN,
        });
      };
      if (!offerSource) {
        var regions = $resource('api/v1/regions').query();
        regions.$promise.then(function success() {
          var containsTallinn = R.any(R.propEq('name', TALLINN), regions);
          if (containsTallinn) {
            selectTallinn();
          } else {
            openSourceSelection();
          }
        }, function failure() {
          openSourceSelection();
        });
      } else if (!offerSource.region) {
        openSourceSelection();
      }
    }
  ]);
})();
