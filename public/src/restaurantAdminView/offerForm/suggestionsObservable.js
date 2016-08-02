(function() {
  'use strict';
  var module = angular.module('offerFormDirective');

  module.factory('requestSuggestions',  ['$http', function($http) {
    return function(args) {
      return Rx.Observable.fromPromise(
        $http.post('/api/v1/restaurants/' + args.restaurantID + '/offer_suggestions', {
          title: args.title,
        })
      );
    };
  }]);

  // Can be used to avoid showing the single suggestion after the user has
  // selected a suggestion and the title field is filled with the selected
  // offer.
  function onlySuggestionSelected(args) {
    var suggestions = args.suggestions;
    var title = args.title;
    return suggestions.length == 1 && suggestions[0].title === title;
  }

  module.factory('suggestionsObservable', ['requestSuggestions', function(requestSuggestions) {
    return function(args) {
      var titleObservable = args.titleObservable;
      var restaurantID = args.restaurantID;
      var scheduler = args.scheduler || Rx.Scheduler.default;

      return titleObservable
        .filter(function(title) {
          // Test for self-equality, to avoid calling for NaN values
          return title !== null && (typeof title !== 'undefined') && title === title;
        })
        .skip(1) // We don't want to show suggestions for the initial value
        .debounce(500, scheduler)
        .filter(R.compose(
          R.lt(2),
          R.length
        ))
        .flatMapLatest(function(title) {
          return requestSuggestions({
            title: title,
            restaurantID: restaurantID,
          }).map(R.prop('data'))
            .map(function(suggestions) {
              return {
                suggestions: suggestions,
                title: title,
              };
            });
        })
        .filter(R.propSatisfies(R.complement(R.isNil), 'suggestions'))
        .filter(R.complement(onlySuggestionSelected))
        .map(R.prop('suggestions'));
    };
  }]);
})();
