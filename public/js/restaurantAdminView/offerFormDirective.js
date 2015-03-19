(function() {
  'use strict';
  var module = angular.module('offerFormDirective', [
    'ngTagsInput',
    'fileReaderService',
  ]);

  module.config(['tagsInputConfigProvider',
    function(tagsInputConfigProvider) {
      tagsInputConfigProvider.setDefaults('tagsInput', {
        placeholder: '',
      });
    }
  ]);

  module.directive('offerForm', ['fileReader',
    function(fileReader) {
      return {
        scope: {
          prefillOffer: '=prefillWith',
          submitFunction: '&onSubmit',
          cancelFunction: '&onCancel',
        },
        controller: function($scope, $element, $attrs, $transclude) {
          (function prefillWith(offer) {
            if (offer) {
              $scope.title = offer.title;
              $scope.tags = offer.tags;
              $scope.price = offer.price;
              $scope.date = new Date(offer.from_time);
              $scope.fromTime = new Date(offer.from_time);
              $scope.toTime = new Date(offer.to_time);
              $scope.image = offer.image; // XXX this needs attention prolly
            }
          })($scope.prefillOffer);
          $scope.idPrefix = (function(prefillOffer) {
            if (prefillOffer)
              return 'edit-offer-' + prefillOffer._id + '-';
            else
              return 'new-offer-';
          })($scope.prefillOffer);
          $scope.today = (function() {
            var now = new Date();
            // this is basically when the clock in UTC will show what it shows here now
            var currentTimeInUTC = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
            // because the toISOString method uses UTC but we want the date in the current timezone
            return currentTimeInUTC.toISOString().split('T')[0];
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
            var offer = {
              title: $scope.title,
              tags: $scope.tags.map(function(tag) {
                return tag.text;
              }),
              price: $scope.price,
              // both getTime()s return the time with added timezone offset, so one offset has to be subtracted
              from_time: new Date($scope.date.getTime() + $scope.fromTime.getTime() - $scope.fromTime.getTimezoneOffset() * 60 * 1000),
              to_time: new Date($scope.date.getTime() + $scope.toTime.getTime() - $scope.toTime.getTimezoneOffset() * 60 * 1000),
              image: $scope.image,
            };
            $scope.submitFunction({
              $offer: offer,
            });
          };
          $scope.setAsPreview = function(file) {
            if (file) {
              fileReader.readAsDataUrl(file, $scope).then(function(result) {
                $scope.previewImageSrc = result;
              });
            } else {
              $scope.$apply(function() {
                $scope.previewImageSrc = '';
              });
            }
          };
        },
        restrict: 'E',
        templateUrl: 'partials/offerForm.html'
      };
    }
  ]);

  module.directive('previewImage', [
    function() {
      return {
        restrict: 'A',
        link: function($scope, element) {
          element.bind('change', function(event) {
            var file = (event.srcElement || event.target).files[0];
            $scope.setAsPreview(file);
          });
        }
      };
    }
  ]);
})();
