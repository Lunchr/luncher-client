(function() {
  'use strict';
  var module = angular.module('tagInputDirective', [
    'ngResource',
  ]);

  module.directive('tagInput', ['$resource',
    function($resource) {
      return {
        require: 'ngModel',
        scope: {
          tags: '=ngModel',
        },
        controllerAs: 'ctrl',
        bindToController: true,
        controller: function($scope, $element, $attrs) {
          var ctrl = this;
          ctrl.availableTagList = $resource('api/v1/tags', {}, {
            'queryCached': {
              method: 'GET',
              isArray: true,
              cache: true,
            }
          }).queryCached();
          ctrl.isSelected = function(availableTag) {
            return R.any(R.propEq('name', availableTag.name), ctrl.tags);
          };

        },
        restrict: 'E',
        templateUrl: 'src/restaurantAdminView/offerForm/tagInput.html'
      };
    }
  ]);
})();
