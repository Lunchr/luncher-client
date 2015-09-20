(function() {
  'use strict';
  var module = angular.module('restaurantSelection', [
    'ngResource',
  ]);

  module.controller('RestaurantSelectionCtrl', ['$resource', 'restaurants',
    function($resource, restaurants) {
      var vm = this;
      vm.restaurants = restaurants;
    }
  ]);
})();
