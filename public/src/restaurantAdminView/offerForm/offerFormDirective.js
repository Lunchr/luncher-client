(function() {
  'use strict';
  var module = angular.module('offerFormDirective', [
    'ngTagsInput',
    'ngResource',
    'ngImageInputWithPreview',
    '720kb.datepicker',
  ]);

  module.config(['tagsInputConfigProvider',
    function(tagsInputConfigProvider) {
      tagsInputConfigProvider.setDefaults('tagsInput', {
        placeholder: '',
      });
    }
  ]);

  module.directive('offerForm', ['$resource', 'filterFilter',
    function($resource, filterFilter) {
      return {
        scope: {
          offerToEdit: '=edit',
          submitFunction: '&onSubmit',
          cancelFunction: '&onCancel',
          deleteFunction: '&onDelete',
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
        },
        restrict: 'E',
        templateUrl: 'src/restaurantAdminView/offerForm/offerForm.html'
      };
    }
  ]);
})();
