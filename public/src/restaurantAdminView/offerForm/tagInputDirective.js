(function() {
  'use strict';
  var module = angular.module('tagInputDirective', [
    'ngResource',
  ]);

  var SHOW_MORE_LIMIT = 5;

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
          var getFilteredTagList = function() {
            return filterFilter(availableTagList, ctrl.filter);
          };
          ctrl.getAvailableTagList = function() {
            return R.compose(
              R.unless(
                R.always(ctrl.showMore),
                R.take(SHOW_MORE_LIMIT)
              ),
              R.sortBy(R.complement(ctrl.isSelected))
            )(getFilteredTagList());
          };
          ctrl.availableTagListIsLimited = function() {
            return getFilteredTagList().length > SHOW_MORE_LIMIT;
          };

          ctrl.isSelected = function(availableTag) {
            return R.ifElse(
              R.isNil,
              R.always(false),
              R.any(R.propEq('name', availableTag.name))
            )(ctrl.tags);
          };

          var toggleTagInList = function(tag, tagList) {
            var matchesTag = R.propEq('name', tag.name);
            return R.ifElse(
              R.isNil,
              R.always([tag]),
              R.ifElse(
                R.any(matchesTag),
                R.reject(matchesTag),
                R.append(tag)
              )
            )(tagList);
          };
          ctrl.selectTag = function(tag) {
            ctrl.tags = toggleTagInList(tag, ctrl.tags);
          };
        },
        restrict: 'E',
        templateUrl: 'src/restaurantAdminView/offerForm/tagInput.html'
      };
    }
  ]);
})();
