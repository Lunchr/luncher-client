(function() {
  'use strict';
  var module = angular.module('registerLogin', []);

  module.controller('RegisterLoginCtrl', ['$location', 'redirectURL',
    function($location, redirectURL) {
      var vm = this;
      vm.unauthorized = !!redirectURL.error;
      vm.redirectURL = redirectURL.url;
    }
  ]);
})();
