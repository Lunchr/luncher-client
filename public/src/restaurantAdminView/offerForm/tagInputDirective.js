(function() {
  'use strict';
  var module = angular.module('tagInputDirective', [
    'ngResource',
  ]);

  module.directive('tagInput', ['$resource', 'filterFilter',
    function($resource, filterFilter, getSuggestionsObservable) {
      return {
        require: 'ngModel',
        scope: {
          tags: '=ngModel',
        },
        controllerAs: 'ctrl',
        bindToController: true,
        controller: function($scope, $element, $attrs) {
          var ctrl = this;

        },
        restrict: 'E',
        templateUrl: 'src/restaurantAdminView/offerForm/tagInput.html'
      };
    }
  ]);
})();
