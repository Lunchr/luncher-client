(function() {
  'use strict';
  var module = angular.module('offerFormDirective', [
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

  module.directive('offerForm', ['$resource', '$http', 'filterFilter',
    function($resource, $http, filterFilter) {
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
          })();
          function prefillWith(offer) {
            $scope.isEdit = !!offer;
            if (offer) {
              $scope.title = offer.title;
              $scope.ingredients = offer.ingredients;
              $scope.tags = offer.tags;
              $scope.price = offer.price;
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
              if (offer.image) {
                $scope.image = offer.image.large;
              } else if (offer.image_data) {
                $scope.image = offer.image_data;
              }
            }
          }
          prefillWith($scope.offerToEdit);
          $scope.$watch('offerToEdit', function(value) {
            prefillWith(value);
          });
          $scope.idPrefix = (function() {
            if ($scope.isEdit)
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
              if (input.$dirty && input.$touched && input.$invalid)
                return true;
            }
            return false;
          };
          $scope.submitOffer = function() {
            var date = new Date($scope.date);
            date.setHours(0, 0, 0, 0);
            var offer = {
              title: $scope.title,
              ingredients: $scope.ingredients.map(function(ingredient) {
                return ingredient.text;
              }),
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
            if ($scope.isEdit) {
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
          var titleSubject = new Rx.Subject();
          $scope.$watch('form.title.$viewValue', function(title) {
            // Test for self-equality, to avoid calling for NaN values
            if (title !== null && (typeof title !== 'undefined') && title === title) {
              titleSubject.onNext(title);
            }
          });
          var disposable = new Rx.CompositeDisposable();
          disposable.add(titleSubject
            .skip(1)
            .debounce(500)
            .filter(R.compose(
              R.lt(2),
              R.length
            ))
            .flatMapLatest(function(title) {
              return Rx.Observable.fromPromise(
                $http.post('/api/v1/restaurants/' + $scope.restaurantID + '/offer_suggestions', {
                  title: title,
                })
              );
            })
            .map(R.prop('data'))
            .filter(R.complement(R.isNil))
            .filter(R.complement(function(suggestions) {
              return suggestions.length == 1 && suggestions[0].title == $scope.title;
            }))
            .subscribe(function(suggestions) {
              $scope.suggestions = suggestions;
              $scope.highlightedSuggestionIndex = null;
              $scope.$apply();
            }));
          $scope.selectSuggestion = function(suggestion) {
            prefillWith(suggestion);
            $scope.highlightedSuggestionIndex = null;
            $scope.suggestions = [];
          };

          var keypressObservable = Rx.Observable.fromEvent($element, 'keydown').publish();
          var upArrowObservable = keypressObservable.filter(R.propEq('keyCode', 38));
          var downArrowObservable = keypressObservable.filter(R.propEq('keyCode', 40));
          var enterObservable = keypressObservable.filter(R.propEq('keyCode', 13));

          disposable.add(Rx.Observable.merge(
            upArrowObservable,
            downArrowObservable,
            enterObservable
          ).subscribe(R.invoker(0, 'preventDefault')));

          $scope.highlightedSuggestionIndex = null;
          disposable.add(upArrowObservable
            .filter(function() {
              return $scope.suggestions && $scope.suggestions.length > 0;
            })
            .subscribe(function() {
              if ($scope.highlightedSuggestionIndex === null) {
                // The last element
                $scope.highlightedSuggestionIndex = $scope.suggestions.length - 1;
              } else {
                $scope.highlightedSuggestionIndex = mod($scope.highlightedSuggestionIndex - 1, $scope.suggestions.length);
              }
              $scope.$apply();
            }));
          disposable.add(downArrowObservable
            .filter(function() {
              return $scope.suggestions && $scope.suggestions.length > 0;
            })
            .subscribe(function() {
              if ($scope.highlightedSuggestionIndex === null) {
                $scope.highlightedSuggestionIndex = 0;
              } else {
                $scope.highlightedSuggestionIndex = mod($scope.highlightedSuggestionIndex + 1, $scope.suggestions.length);
              }
              $scope.$apply();
            }));
          disposable.add(enterObservable
            .filter(function() {
              return $scope.highlightedSuggestionIndex !== null;
            })
            .subscribe(function() {
              prefillWith($scope.suggestions[$scope.highlightedSuggestionIndex]);
              $scope.highlightedSuggestionIndex = null;
              $scope.suggestions = [];
              $scope.$apply();
            }));
          disposable.add(keypressObservable.connect());


          $scope.$on('$destroy', function() {
            titleSubject.dispose();
            disposable.dispose();
          });
        },
        restrict: 'E',
        templateUrl: 'src/restaurantAdminView/offerForm/offerForm.html'
      };
    }
  ]);
})();
