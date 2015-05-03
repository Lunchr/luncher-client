(function() {
  'use strict';
  var module = angular.module('offerListControllers', [
    'ngResource',
    'offerListFilters',
    'offerListSorters',
  ]);

  module.controller('TagListCtrl', ['$scope', '$resource', 'offerFilterStateService',
    function($scope, $resource, offerFilterStateService) {
      var tags = this;
      var mainTags = ['supp', 'praad', 'magustoit'];
      tags.isMainTag = function(tag, index) {
        return mainTags.indexOf(tag.name) > -1;
      };
      tags.isNotMainTag = function(tag, index) {
        return !tags.isMainTag(tag, index);
      };
      tags.mainTagIndex = function(tag, index) {
        return mainTags.indexOf(tag.name);
      };
      tags.list = $resource('api/v1/tags').query({}, function success() {
        decorateSelectedTags(tags.list);
      });
      function decorateSelectedTags(tagList) {
        var filterState = offerFilterStateService.getCurrent();
        if (filterState && filterState.selectedTags) {
          tagList.forEach(function(tag) {
            if (tags.isMainTag(tag)) {
              tag.selected = filterState.selectedTags.main.indexOf(tag.name) > -1;
            } else {
              tag.selected = filterState.selectedTags.others.indexOf(tag.name) > -1;
            }
          });
        }
      }

      $scope.$watch(function() {
        return tags.list;
      }, function(tagList, oldTagList) {
        if (tagList === oldTagList) {
          return;
        }
        tags.selected = [];
        var filterState = offerFilterStateService.getCurrent();
        if (!filterState) {
          filterState = {};
        }
        filterState.selectedTags = {
          main: [],
          others: [],
        };
        tagList.forEach(function(tag) {
          if (tag.selected) {
            if (tags.isMainTag(tag)) {
              filterState.selectedTags.main.push(tag.name);
            } else {
              filterState.selectedTags.others.push(tag.name);
              tags.selected.push(tag.display_name);
            }
          }
        });
        offerFilterStateService.update(filterState);
      }, true);
    }
  ]);

  module.controller('SearchCtrl', ['$scope', 'offerFilterStateService',
    function($scope, offerFilterStateService) {
      var search = this;
      var filterState = offerFilterStateService.getCurrent();
      if (filterState) {
          search.query = filterState.query;
      }
      $scope.$watch(function() {
        return search.query;
      }, function(query, oldQuery) {
        if (query === oldQuery) {
          return;
        }
        var filterState = offerFilterStateService.getCurrent();
        if (!filterState) {
          filterState = {};
        }
        filterState.query = query;
        offerFilterStateService.update(filterState);
      }, true);
    }
  ]);
})();
