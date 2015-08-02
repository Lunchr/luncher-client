(function() {
  'use strict';
  var module = angular.module('registerForm', [
    'ngResource',
    'geoSpecifier',
  ]);

  module.controller('RegisterFormCtrl', ['$resource', '$location', 'page',
    function($resource, $location, page) {
      var vm = this;
      var specifier;
      if (page) {
        vm.restaurant = {
          name: page.name,
          address: page.address,
          phone: page.phone,
          website: page.website,
        };
      }

      vm.submit = function() {
        var restaurant = vm.restaurant;
        var location = specifier.getLocation();
        restaurant.location = {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        };
        $resource('/api/v1/restaurants').save(restaurant,
          function success() {
            $location.path('/admin');
          }, function fail(response) {
            vm.errorMessage = response.data;
          }
        );
      };

      vm.isReadyForError = function() {
        for (var i = 0; i < arguments.length; i++) {
          var input = arguments[i];
          // If the user has clicked submit, we want to draw their attention to the
          // invalid fields.
          if ((vm.submitClicked || (input.$dirty && input.$touched)) && input.$invalid)
            return true;
        }
        return false;
      };

      vm.registerSpecifier = function(_specifier_) {
        specifier = _specifier_;
      };
    }
  ]);
})();
