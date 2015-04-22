(function() {
  'use strict';
  var offerListFilters = angular.module('offerListFilters', []);

  offerListFilters.value('offerFilterState', {});

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

  offerListFilters.filter('tag', ['filterFilter', 'offerFilterState', 'doIntersect',
    function(filterFilter, offerFilterState, doIntersect) {
      return function(offers) {
        return filterFilter(offers, function(offer) {
          if (offerFilterState.selectedTags && offerFilterState.selectedTags.length > 0) {
            return doIntersect(offerFilterState.selectedTags, offer.tags);
          }
          return true;
        });
      };
    }
  ]);

  offerListFilters.filter('search', ['filterFilter', 'offerFilterState',
    function(filterFilter, offerFilterState) {
      return function(offers) {
        return filterFilter(offers, function(offer) {
          var query = new RegExp(offerFilterState.query, 'i');

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
