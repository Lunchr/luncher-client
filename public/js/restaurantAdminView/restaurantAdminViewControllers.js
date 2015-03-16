(function() {
  'use strict';
  var module = angular.module('restaurantAdminViewControllers', [
    'ngResource',
    'ngTagsInput',
  ]);
  var offerPostedEventChannel = 'offer-posted';

  module.controller('RestaurantAdminViewCtrl', ['$scope', '$resource',
    function($scope, $resource) {
      $scope.restaurant = $resource('api/v1/restaurants/me').get();
    }
  ]);

  module.controller('RestaurantOfferListCtrl', ['$scope', '$resource',
    function($scope, $resource) {
      $scope.offers = $resource('api/v1/restaurants/me/offers').query();
      $scope.$on(offerPostedEventChannel, function(event, offer) {
        $scope.offers.unshift(offer);

        offer.confirmationPending = true;
        offer.$promise.then(function(){
          offer.confirmationPending = false;
        }, function(){
          // we could, in theory, use shift(), but I don't think we can guarantee at
          // this point that this offer is still the first one
          var index = $scope.offers.indexOf(offer);
          if (index > -1) {
            $scope.offers.splice(index, 1);
          }
        });
      });
    }
  ]);

  module.config(['tagsInputConfigProvider',
    function(tagsInputConfigProvider) {
      tagsInputConfigProvider.setDefaults('tagsInput', {
        placeholder: '',
      });
    }
  ]);
  module.controller('RestaurantAddOfferCtrl', ['$scope', 'fileReader', '$resource',
    function($scope, fileReader, $resource) {
      var now = new Date();
      // this is basically when the clock in UTC will show what it shows here now
      var currentTimeInUTC = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000);
      // because the toISOString method uses UTC but we want the date in the current timezone
      $scope.today = currentTimeInUTC.toISOString().split('T')[0];
      $scope.postOffer = function() {
        var offer = $resource('api/v1/offers').save({
          title: $scope.title,
          tags: $scope.tags,
          price: $scope.price,
          // both getTime()s return the time with added timezone offset, so one offset has to be subtracted
          from_time: new Date($scope.date.getTime() + $scope.fromTime.getTime() - $scope.fromTime.getTimezoneOffset() * 60 * 1000),
          to_time: new Date($scope.date.getTime() + $scope.toTime.getTime() - $scope.toTime.getTimezoneOffset() * 60 * 1000),
          image: $scope.image,
          restaurant: $scope.$parent.restaurant
        });
        $scope.$parent.$broadcast(offerPostedEventChannel, offer);
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
