(function() {
  'use strict';
  var module = angular.module('registerForm', []);

  module.controller('RegisterFormCtrl', ['page',
    function(page) {
      var vm = this;
      if (page) {
        vm.restaurant = {
          name: page.name,
          address: page.address,
          phone: page.phone,
          webpage: page.webpage,
        };
      }

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
