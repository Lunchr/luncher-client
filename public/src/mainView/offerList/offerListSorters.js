(function() {
  'use strict';
  var offerListSorters = angular.module('offerListSorters', []);

  offerListSorters.value('offerOrderState', {});

  offerListSorters.directive('offersSorter', ['offerOrderState',
    function(offerOrderState) {
      return {
        scope: {
          orderBy: '@',
          isNumeric: '@'
        },
        controller: function($scope, $element, $attrs, $transclude) {
          $scope.isAscending = true;
          $scope.clicked = function() {
            $scope.isAscending = !$scope.isAscending;
            offerOrderState.orderBy = $scope.orderBy;
            offerOrderState.isAscending = $scope.isAscending;
          };
          $scope.isActive = function() {
            return $scope.orderBy === offerOrderState.orderBy;
          };
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/offersSorterDirective.html',
        replace: true,
        transclude: true
      };
    }
  ]);

  offerListSorters.filter('order', ['orderByFilter', 'offerOrderState',
    function(orderByFilter, offerOrderState) {
      return function(offers) {
        var asc = offerOrderState.isAscending;
        var reverse = typeof asc === 'undefined' ? false : !asc;
        var reversePrefix = reverse ? '-' : '';
        // The ! apparently makes truthy values be first and falsy ones second,
        // which is exactly what we want. It worked similarly without the !, but
        // behaved a bit strangely when the value was actually false not, say, undefined.
        return orderByFilter(offers, ['!isFavorite', reversePrefix+offerOrderState.orderBy]);
      };
    }
  ]);
})();
