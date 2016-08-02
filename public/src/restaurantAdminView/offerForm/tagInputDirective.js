(function() {
  'use strict';
  var module = angular.module('tagInputDirective', [
    'ngResource',
  ]);

  module.directive('tagInput', ['$resource', 'filterFilter',
    function($resource, filterFilter) {
      return {
        require: 'ngModel',
        scope: {
          tags: '=ngModel',
        },
        controllerAs: 'ctrl',
        bindToController: true,
        controller: function($scope, $element, $attrs) {
          var ctrl = this;
          var availableTagList = $resource('api/v1/tags', {}, {
            'queryCached': {
              method: 'GET',
              isArray: true,
              cache: true,
            }
          }).queryCached();

          ctrl.showMore = false;
          ctrl.getFilteredTags = function(query) {
            return R.compose(
              R.unless(R.always(ctrl.showMore), R.take(5)),
              R.curryN(2, filterFilter)(R.__, query)
            )(availableTagList);
          };

          ctrl.isSelected = function(availableTag) {
            return R.ifElse(
              R.isNil,
              R.always(false),
              R.any(R.propEq('name', availableTag.name))
            )(ctrl.tags);
          };

        },
        restrict: 'E',
        templateUrl: 'src/restaurantAdminView/offerForm/tagInput.html'
      };
    }
  ]);
})();
