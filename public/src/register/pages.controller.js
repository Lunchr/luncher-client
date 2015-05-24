(function() {
  'use strict';
  var module = angular.module('registerPages', []);

  module.controller('RegisterPagesCtrl', ['$location', 'pages',
    function($location, pages) {
      var vm = this;
      vm.pages = pages;
      vm.submit = function() {
        $location.path('/register/form/' + vm.selectedPage);
      };
      vm.skip = function() {
        $location.path('/register/form');
      };
    }
  ]);
})();
