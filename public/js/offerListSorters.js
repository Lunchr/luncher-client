(function(){
  'use strict';
  var offerListSorters = angular.module('offerListSorters', []);

  offerListSorters.value('offerOrderState', {});

  offerListSorters.directive('offersSorter', ['offerOrderState', function (offerOrderState){
    return {
      scope: {
        orderBy: '@'
      },
      controller: function($scope, $element, $attrs, $transclude) {
        $scope.isAscending = true;
        $scope.clicked = function (){
          $scope.isAscending = !$scope.isAscending;
          offerOrderState.orderBy = $scope.orderBy;
          offerOrderState.isAscending = $scope.isAscending;
        };
        $scope.isActive = function (){
          return $scope.orderBy === offerOrderState.orderBy;
        };
      },
      restrict: 'E',
      templateUrl: 'partials/offersSorterDirective.html',
      replace: true,
      transclude: true
    };
  }]);

  offerListSorters.filter('order', ['orderByFilter', 'offerOrderState', function (orderByFilter, offerOrderState){
    return function (offers){
      var asc = offerOrderState.isAscending;
      var reverse = typeof asc === 'undefined' ? false : !asc;
      return orderByFilter(offers, offerOrderState.orderBy, reverse);
    };
  }]);
})();
