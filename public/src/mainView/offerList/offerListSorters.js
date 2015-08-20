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
      var INITIAL_IS_ASCENDING_STATE = true;
      return {
        scope: {
          orderBy: '@',
          isNumeric: '@'
        },
        controller: function($scope, $element, $attrs, $transclude) {
          $scope.clicked = function() {
            if (!$scope.isActive()) {
              $scope.isAscending = INITIAL_IS_ASCENDING_STATE;
              updateOrderState();
            } else if ($scope.isAscending === INITIAL_IS_ASCENDING_STATE) {
              $scope.isAscending = !$scope.isAscending;
              updateOrderState();
            } else {
              clearOrderState();
            }
          };
          $scope.isActive = function() {
            return $scope.orderBy === offerOrderStateService.getCurrent().orderBy;
          };
          if ($scope.orderBy === 'restaurant.distance') {
            offerSourceService.subscribeToChanges($scope, function(offerSource) {
              if (offerSource.location) {
                $isAscending = INITIAL_IS_ASCENDING_STATE;
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
          function clearOrderState() {
            offerOrderStateService.update({
              orderBy: null,
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
