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

  module.controller('MainViewCtrl', ['offerSourceService',
    function(offerSourceService) {
      var vm = this;
      if (!vm.state) {
        vm.state = {};
      }
      var offerSource = offerSourceService.getCurrent();
      vm.offerSource = offerSource;
      if (!offerSource || !offerSource.region) {
        vm.state.sourceSelectionPopup = 'active';
      }
    }
  ]);
})();
