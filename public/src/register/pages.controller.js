(function() {
  'use strict';
  var module = angular.module('registerPages', []);

  module.controller('RegisterPagesCtrl', ['pages',
    function(pages) {
      var vm = this;
      vm.pages = pages;
    }
  ]);
})();
