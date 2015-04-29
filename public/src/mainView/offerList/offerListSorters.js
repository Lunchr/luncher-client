(function() {
  'use strict';
  var module = angular.module('offerListSorters', ['offerSource']);

  module.value('offerOrderState', {});

  module.directive('offersSorter', ['offerOrderState', 'offerSourceService',
    function(offerOrderState, offerSourceService) {
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
            return $scope.orderBy === offerOrderState.orderBy;
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
            offerOrderState.orderBy = $scope.orderBy;
            offerOrderState.isAscending = $scope.isAscending;
          }
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/offersSorterDirective.html',
        replace: true,
        transclude: true
      };
    }
  ]);

  module.filter('order', ['orderByFilter', 'offerOrderState',
    function(orderByFilter, offerOrderState) {
      return function(offers) {
        if (!offerOrderState.orderBy) {
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
