(function() {
  'use strict';
  var module = angular.module('restaurantAdminViewControllers', [
    'ngResource'
  ]);

  module.controller('RestaurantAdminViewCtrl', ['$scope', '$resource',
    function($scope, $resource) {
      $scope.restaurant = $resource('api/v1/restaurants/me').get();
    }
  ]);

  module.controller('RestaurantOfferListCtrl', ['$scope', '$resource',
    function($scope, $resource) {
      $scope.offers = $resource('api/v1/restaurants/me/offers').query();
    }
  ]);

  module.controller('RestaurantAddOfferCtrl', ['$scope', 'fileReader',
    function($scope, fileReader) {
      $scope.postOffer = function() {
      };
      $scope.setAsPreview = function(file) {
        if (file) {
          fileReader.readAsDataUrl(file, $scope).then(function(result) {
            $scope.previewImageSrc = result;
          });
        } else {
          $scope.$apply(function(){
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
        link: function($scope, element){
          element.bind('change', function(event){
            var file = (event.srcElement || event.target).files[0];
            $scope.setAsPreview(file);
          });
        }
      };
    }
  ]);
})();
