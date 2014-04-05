'use strict';
var offerListFilters = angular.module('offerListFilters', []);

offerListFilters.value('offerFilterState', {});

offerListFilters.factory('doIntersect', function(){
  return function (as, bs){
    return !!as && as.some(function (a){
      return !!bs && bs.some(function (b){
          return a === b;
      });
    });
  };
});

offerListFilters.factory('levDist', function(){
  //http://stackoverflow.com/a/11958496/1456578, Damerau–Levenshtein distance (Wikipedia)
  return function(s, t) {
    var d = []; //2d matrix

    // Step 1
    var n = s.length;
    var m = t.length;

    if (n == 0) return m;
    if (m == 0) return n;

    //Create an array of arrays in javascript (a descending loop is quicker)
    for (var i = n; i >= 0; i--) d[i] = [];

    // Step 2
    for (var i = n; i >= 0; i--) d[i][0] = i;
    for (var j = m; j >= 0; j--) d[0][j] = j;

    // Step 3
    for (var i = 1; i <= n; i++) {
      var s_i = s.charAt(i - 1);

      // Step 4
      for (var j = 1; j <= m; j++) {

        //Check the jagged ld total so far
        if (i == j && d[i][j] > 4) return n;

        var t_j = t.charAt(j - 1);
        var cost = (s_i == t_j) ? 0 : 1; // Step 5

        //Calculate the minimum
        var mi = d[i - 1][j] + 1;
        var b = d[i][j - 1] + 1;
        var c = d[i - 1][j - 1] + cost;

        if (b < mi) mi = b;
        if (c < mi) mi = c;

        d[i][j] = mi; // Step 6

        //Damerau transposition
        if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
        }
      }
    }

    // Step 7
    return d[n][m];
  }
});

offerListFilters.filter('tag', ['filterFilter', 'offerFilterState', 'doIntersect',
  function (filterFilter, offerFilterState, doIntersect){
    return function (offers){
      return filterFilter(offers, function (offer){
        if (offerFilterState.selectedTags && offerFilterState.selectedTags.length > 0){
          return doIntersect(offerFilterState.selectedTags, offer.tags);
        }
        return true;
      });
    };
  }
]);

offerListFilters.filter('search', ['filterFilter', 'offerFilterState', function (filterFilter, offerFilterState){
  return function (offers){
    return filterFilter(offers, function (offer){
      var query = new RegExp(offerFilterState.query, 'i');

      var result = offer.title.match(query);
      result = result || offer.description.match(query);
      result = result || offer.location.match(query);
      result = result || offer.tags.some(function (tag){
        return tag.match(query);
      });
      return result;
    });
  };
}]);
