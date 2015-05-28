(function() {
  'use strict';
  var module = angular.module('registerForm', [
    'ngResource',
    'geoSpecifier',
  ]);

  module.controller('RegisterFormCtrl', ['$resource', '$location', 'page',
    function($resource, $location, page) {
      var vm = this;
      if (page) {
        vm.restaurant = {
          name: page.name,
          address: page.address,
          phone: page.phone,
          webpage: page.webpage,
          region: 'ee',
        };
      }

      vm.submit = function() {
        $resource('/api/v1/restaurants').save(vm.restaurant,
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
          if (input.$dirty && input.$touched && input.$invalid)
            return true;
        }
        return false;
      };
    }
  ]);
})();
