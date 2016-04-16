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

  module.factory('suggestionsObservable', ['requestSuggestions', function(requestSuggestions) {
    return function(args) {
      var titleObservable = args.titleObservable;
      var restaurantID = args.restaurantID;
      var getCurrentTitle = args.getCurrentTitle;
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
          });
        })
        .map(R.prop('data'))
        .filter(R.complement(R.isNil))
        .filter(R.complement(function(suggestions) {
          // Avoid showing the single suggestion after the user has
          // selected a suggestion and the title field is filled with the
          // selected offer.
          return suggestions.length == 1 && suggestions[0].title == getCurrentTitle();
        }));
    };
  }]);
})();
