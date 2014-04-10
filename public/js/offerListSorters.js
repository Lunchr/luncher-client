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
      },
      restrict: 'E',
      template: '<span ng-class="\'order-\' + (isAscending ? \'asc\' : \'desc\')" ng-click="clicked()" ng-transclude></span>',
      replace: true,
      transclude: true
    };
  }]);
})();
