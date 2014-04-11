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
      template: '<span ng-class="{\'order-active\': isActive(), \'order-asc\': isAscending, \'order-desc\': !isAscending }" ng-click="clicked()" ng-transclude></span>',
      replace: true,
      transclude: true
    };
  }]);
})();
