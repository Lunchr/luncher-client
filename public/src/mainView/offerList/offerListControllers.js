(function() {
  'use strict';
  var module = angular.module('offerListControllers', [
    'ngResource',
    'offerListFilters',
    'offerListSorters',
  ]);

  module.controller('TagListCtrl', ['$scope', 'offerFilterState', '$resource',
    function($scope, offerFilterState, $resource) {
      var tags = this;
      tags.list = $resource('api/v1/tags').query();

      $scope.$watch(function() {
        return tags.list;
      }, function(tagList) {
        tags.selected = [];
        offerFilterState.selectedTags = [];
        tagList.forEach(function(tag) {
          if (tag.selected) {
            offerFilterState.selectedTags.push(tag.name);
            tags.selected.push(tag.display_name);
          }
        });
      }, true);
    }
  ]);

  module.controller('SearchCtrl', ['$scope', 'offerFilterState',
    function($scope, offerFilterState) {
      var search = this;
      $scope.$watch(function() {
        return search.query;
      }, function(query) {
        offerFilterState.query = query;
      }, true);
    }
  ]);
})();
