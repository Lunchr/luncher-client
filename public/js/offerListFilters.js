'use strict';
var offerListFilters = angular.module('offerListFilters', []);

offerListFilters.value('offerFilterState', {});

offerListFilters.factory('doIntersect', function(){
  return function (as, bs){
    if (!as || !bs) return false;
    return as.some(function (a){
      return bs.some(function (b){
          return a === b;
      });
    });
  };
});

offerListFilters.filter('tag', ['filterFilter', 'offerFilterState', 'doIntersect', function (filterFilter, offerFilterState, doIntersect){
  return function (offers){
    return filterFilter(offers, function (offer){
      if (offerFilterState.selectedTags && offerFilterState.selectedTags.length > 0){
        return doIntersect(offerFilterState.selectedTags, offer.tags);
      }
      return true;
    });
  };
}]);
