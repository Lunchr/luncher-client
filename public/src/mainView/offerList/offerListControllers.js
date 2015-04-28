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
      var mainTags = ['praad', 'supp', 'magustoit'];
      tags.isMainTag = function(tag, index) {
        return mainTags.indexOf(tag.name) > -1;
      };
      tags.isNotMainTag = function(tag, index) {
        return !tags.isMainTag(tag, index);
      };
      tags.list = $resource('api/v1/tags').query();

      $scope.$watch(function() {
        return tags.list;
      }, function(tagList) {
        tags.selected = [];
        offerFilterState.selectedTags = {
          main: [],
          others: [],
        };
        tagList.forEach(function(tag) {
          if (tag.selected) {
            if (tags.isMainTag(tag)) {
              offerFilterState.selectedTags.main.push(tag.name);
            } else {
              offerFilterState.selectedTags.others.push(tag.name);
              tags.selected.push(tag.display_name);
            }
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
