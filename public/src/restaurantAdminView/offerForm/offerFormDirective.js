(function() {
  'use strict';
  var module = angular.module('offerFormDirective', [
    'tagInputDirective',
    'ngTagsInput',
    'ngResource',
    'ngImageInputWithPreview',
    '720kb.datepicker',
  ]);

  // JS % operator doesn't play nice with negative numbers
  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  module.config(['tagsInputConfigProvider',
    function(tagsInputConfigProvider) {
      tagsInputConfigProvider.setDefaults('tagsInput', {
        placeholder: '',
      });
    }
  ]);

  module.directive('offerForm', ['$resource', 'filterFilter', 'suggestionsObservable',
    function($resource, filterFilter, getSuggestionsObservable) {
      return {
        scope: {
          offerToEdit: '=edit',
          submitFunction: '&onSubmit',
          cancelFunction: '&onCancel',
          deleteFunction: '&onDelete',
          restaurantID: '=restaurantId',
        },
        controller: function($scope, $element, $attrs) {
          $scope.titleMaxLength = 70;
          $scope.descriptionMaxLength = 140;
          $scope.allTags = $resource('api/v1/tags', {}, {
            'queryCached': {
              method: 'GET',
              isArray: true,
              cache: true,
            }
          }).queryCached();
          $scope.getFilteredTags = function($query) {
            return filterFilter($scope.allTags, $query);
          };
          (function setDefaults() {
            $scope.date = new Date();
            $scope.date.setHours(0, 0, 0, 0);
            $scope.fromTime = new Date(1970, 0, 1, 11, 30);
            $scope.toTime = new Date(1970, 0, 1, 23, 55);
          })();
          $scope.isEdit = function() {
            return !!$scope.offerToEdit;
          };
          function fillWith(offer, opts) {
            if (offer) {
              $scope.title = offer.title;
              $scope.description = offer.description;
              $scope.tags = offer.tags;
              $scope.price = offer.price;
              if (!(opts && opts.avoidOverwritingTime)) {
                $scope.date = new Date(offer.from_time);
                $scope.date.setHours(0, 0, 0, 0);
                $scope.fromTime = new Date(offer.from_time);
                $scope.fromTime.setFullYear(1970);
                $scope.fromTime.setMonth(0);
                $scope.fromTime.setDate(1);
                $scope.toTime = new Date(offer.to_time);
                $scope.toTime.setFullYear(1970);
                $scope.toTime.setMonth(0);
                $scope.toTime.setDate(1);
              }
              if (offer.image) {
                $scope.image = offer.image.large;
              } else if (offer.image_data) {
                $scope.image = offer.image_data;
              }
            }
          }
          fillWith($scope.offerToEdit);
          $scope.$watch('offerToEdit', function(value) {
            fillWith(value);
          });
          $scope.idPrefix = (function() {
            if ($scope.isEdit())
              return 'edit-offer-' + $scope.offerToEdit._id + '-';
            else
              return 'new-offer-';
          })();
          function dateToDateString(date) {
            // this is basically when the clock in UTC will show what it shows here now
            var timeInUTC = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
            // because the toISOString method uses UTC but we want the date in the current timezone
            return timeInUTC.toISOString().split('T')[0];
          }
          $scope.yesterday = (function() {
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return dateToDateString(yesterday);
          })();
          $scope.isReadyForError = function() {
            for (var i = 0; i < arguments.length; i++) {
              var input = arguments[i];
              var dirty = $scope.submitClicked || (input.$dirty && input.$touched);
              if (dirty && input.$invalid)
                return true;
            }
            return false;
          };
          $scope.submitOffer = function() {
            $scope.submitClicked = true;
            if (!$scope.form.$valid) {
              return;
            }
            var date = new Date($scope.date);
            date.setHours(0, 0, 0, 0);
            var offer = {
              title: $scope.title,
              description: $scope.description,
              tags: $scope.tags.map(function(tag) {
                return tag.name;
              }),
              price: $scope.price,
              // both getTime()s return the time with added timezone offset, so one offset has to be subtracted
              from_time: new Date(date.getTime() + $scope.fromTime.getTime() - $scope.fromTime.getTimezoneOffset() * 60 * 1000),
              to_time: new Date(date.getTime() + $scope.toTime.getTime() - $scope.toTime.getTimezoneOffset() * 60 * 1000),
            };
            if ($scope.image && !$scope.image.isPath) {
              offer.image_data = $scope.image.src;
            }
            if ($scope.isEdit()) {
              var offerCopy = angular.copy($scope.offerToEdit);
              delete offerCopy.image;
              angular.extend(offerCopy, offer);
              $scope.submitFunction({
                $currentOffer: $scope.offerToEdit,
                $offer: offerCopy,
              });
            } else {
              $scope.submitFunction({
                $offer: offer,
              });
            }
          };
          var titleObservable = Rx.Observable.create(function(observer) {
            // $scope.$watch returns a function that unregisters the $watching
            // when called. Return this function to act as the dispose method
            // for this observable.
            return $scope.$watch('form.title.$viewValue', observer.onNext.bind(observer));
          });
          var suggestionsObservable = getSuggestionsObservable({
            titleObservable: titleObservable,
            restaurantID: $scope.restaurantID,
          });
          var updateSuggestions = function(suggestions) {
            $scope.suggestions = suggestions;
            $scope.highlightedSuggestionIndex = null;
            $scope.$apply();
          };

          $scope.selectSuggestion = function(suggestion) {
            fillWith(suggestion, {avoidOverwritingTime: true});
            $scope.highlightedSuggestionIndex = null;
            $scope.suggestions = [];
          };

          $scope.highlightedSuggestionIndex = null;
          $scope.clearSuggestionHighlight = function() {
            $scope.highlightedSuggestionIndex = null;
          };

          var titleInput = $element[0].querySelector('input[name=title]');
          // publish() because then we can guarantee that preventDefault is
          // actually called on the same single event instance and that that
          // doesn't stop the rest of the subscriptions here from receiving the
          // event.
          var keypressObservable = Rx.Observable.fromEvent(titleInput, 'keydown').publish();
          var upArrowObservable = keypressObservable.filter(R.propEq('keyCode', 38));
          var downArrowObservable = keypressObservable.filter(R.propEq('keyCode', 40));
          var enterObservable = keypressObservable.filter(R.propEq('keyCode', 13));

          var managedKeypressObservable = Rx.Observable.merge(
            upArrowObservable,
            downArrowObservable,
            enterObservable
          );

          var titleBlurObservable = Rx.Observable.fromEvent(titleInput, 'blur');
          var titleFocusObservable = Rx.Observable.fromEvent(titleInput, 'focus');

          var hasSuggestions = function() {
            return $scope.suggestions && $scope.suggestions.length > 0;
          };
          var highlightPreviousSuggestionObservable = upArrowObservable.filter(hasSuggestions);
          var highlightNextSuggestionObservable = downArrowObservable.filter(hasSuggestions);
          var selectSuggestionObservable = enterObservable
            .filter(function() {
              return $scope.highlightedSuggestionIndex !== null;
            })
            .map(function() {
              return $scope.suggestions[$scope.highlightedSuggestionIndex];
            });

          var highlightPreviousSuggestion = function() {
            if ($scope.highlightedSuggestionIndex === null) {
              // The last element
              $scope.highlightedSuggestionIndex = $scope.suggestions.length - 1;
            } else {
              $scope.highlightedSuggestionIndex = mod($scope.highlightedSuggestionIndex - 1, $scope.suggestions.length);
            }
            $scope.$apply();
          };
          var highlightNextSuggestion = function() {
            if ($scope.highlightedSuggestionIndex === null) {
              $scope.highlightedSuggestionIndex = 0;
            } else {
              $scope.highlightedSuggestionIndex = mod($scope.highlightedSuggestionIndex + 1, $scope.suggestions.length);
            }
            $scope.$apply();
          };
          var selectSuggestion = function(suggestion) {
            $scope.selectSuggestion(suggestion);
            $scope.$apply();
          };
          var closeSuggestions = function() {
            $scope.suggestionsClosed = true;
            $scope.clearSuggestionHighlight();
            $scope.$apply();
          };
          var openSuggestions = function() {
            $scope.suggestionsClosed = false;
            $scope.$apply();
          };

          var disposable = new Rx.CompositeDisposable();
          var err = console.error.bind(console);
          disposable.add(suggestionsObservable.subscribe(updateSuggestions, err));
          disposable.add(managedKeypressObservable.subscribe(R.invoker(0, 'preventDefault'), err));
          disposable.add(highlightPreviousSuggestionObservable.subscribe(highlightPreviousSuggestion, err));
          disposable.add(highlightNextSuggestionObservable.subscribe(highlightNextSuggestion, err));
          disposable.add(selectSuggestionObservable.subscribe(selectSuggestion, err));
          disposable.add(keypressObservable.connect());
          disposable.add(titleBlurObservable.subscribe(closeSuggestions, err));
          disposable.add(titleFocusObservable.subscribe(openSuggestions, err));
          $scope.$on('$destroy', disposable.dispose.bind(disposable));
        },
        restrict: 'E',
        templateUrl: 'src/restaurantAdminView/offerForm/offerForm.html'
      };
    }
  ]);
})();
