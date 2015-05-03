(function() {
  'use strict';
  var offerListFilters = angular.module('offerListFilters', [
    'cookies',
  ]);

  offerListFilters.factory('offerFilterStateService', ['cookies',
    function(cookies) {
      return {
        getCurrent: function() {
          return cookies.getFilterState();
        },
        update: function(filterState) {
          cookies.setFilterState(filterState);
        }
      };
    }
  ]);

  offerListFilters.factory('doIntersect', function() {
    return function(as, bs) {
      return !!as && as.some(function(a) {
        return !!bs && bs.some(function(b) {
          return a === b;
        });
      });
    };
  });

  offerListFilters.filter('approximateDistance', [
    function() {
      return function(input) {
        var approximation = Math.round(input / 10.0) * 10;
        if (input >= 1000) {
          return '~' + (approximation / 1000.0).toFixed(2) + 'km';
        } else {
          return '~' + approximation + 'm';
        }
      };
    }
  ]);

  offerListFilters.filter('tag', ['filterFilter', 'offerFilterStateService', 'doIntersect',
    function(filterFilter, offerFilterStateService, doIntersect) {
      return function(offers) {
        return filterFilter(offers, function(offer) {
          var filterState = offerFilterStateService.getCurrent();
          if (!filterState || !filterState.selectedTags) {
            return true;
          }
          var tags = filterState.selectedTags;
          var mainTagsFilter = true;
          if (tags.main && tags.main.length > 0) {
            mainTagsFilter = doIntersect(tags.main, offer.tags);
          }
          var otherTagsFilter = true;
          if (tags.others && tags.others.length > 0) {
            otherTagsFilter = doIntersect(tags.others, offer.tags);
          }
          return mainTagsFilter && otherTagsFilter;
        });
      };
    }
  ]);

  offerListFilters.filter('search', ['filterFilter', 'offerFilterStateService',
    function(filterFilter, offerFilterStateService) {
      return function(offers) {
        return filterFilter(offers, function(offer) {
          var filterState = offerFilterStateService.getCurrent();
          if (!filterState || !filterState.query) {
            return true;
          }
          var query = new RegExp(filterState.query, 'i');

          var result = offer.title.match(query);
          result = result || offer.ingredients.some(function(ingredient) {
            return ingredient.match(query);
          });
          result = result || offer.restaurant.name.match(query);
          result = result || offer.tags.some(function(tag) {
            return tag.match(query);
          });
          return result;
        });
      };
    }
  ]);
})();
