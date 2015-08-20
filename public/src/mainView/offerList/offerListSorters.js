(function() {
  'use strict';
  var module = angular.module('offerListSorters', [
    'offerSource',
    'pubSub',
  ]);

  module.factory('offerOrderStateService', ['PubSub',
    function(PubSub) {
      var currentState = {};
      return new PubSub(function getter() {
        return currentState;
      }, function setter(orderState) {
        currentState = orderState;
      });
    }
  ]);

  module.directive('offersSorter', ['offerOrderStateService', 'offerSourceService',
    function(offerOrderStateService, offerSourceService) {
      return {
        scope: {
          orderBy: '@',
          isNumeric: '@'
        },
        controller: function($scope, $element, $attrs, $transclude) {
          $scope.isAscending = false;
          $scope.clicked = function() {
            $scope.isAscending = !$scope.isAscending;
            updateOrderState();
          };
          $scope.isActive = function() {
            return $scope.orderBy === offerOrderStateService.getCurrent().orderBy;
          };
          if ($scope.orderBy === 'restaurant.distance') {
            offerSourceService.subscribeToChanges($scope, function(offerSource) {
              if (offerSource.location) {
                $scope.isAscending = true;
                updateOrderState();
              }
            });
          }
          function updateOrderState() {
            offerOrderStateService.update({
              orderBy: $scope.orderBy,
              isAscending: $scope.isAscending,
            });
          }
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/offersSorterDirective.html',
        replace: true,
        transclude: true
      };
    }
  ]);

  module.filter('order', ['orderByFilter', 'offerOrderStateService',
    function(orderByFilter, offerOrderStateService) {
      return function(offers) {
        var offerOrderState = offerOrderStateService.getCurrent();
        if (! offerOrderState || !offerOrderState.orderBy) {
          return offers;
        }
        var asc = offerOrderState.isAscending;
        var reverse = typeof asc === 'undefined' ? false : !asc;
        var reversePrefix = reverse ? '-' : '';
        return orderByFilter(offers, reversePrefix+offerOrderState.orderBy);
      };
    }
  ]);
})();
