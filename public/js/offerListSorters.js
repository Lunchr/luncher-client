(function(){
  'use strict';
  var offerListSorters = angular.module('offerListSorters', []);

  offerListSorters.value('offerOrderState', {});

  offerListSorters.directive('offersSorter', ['offerOrderState', function (offerOrderState){
    // Runs during compile
    return {
      // name: '',
      // priority: 1,
      // terminal: true,
      scope: {
        orderBy: '@'
      }, // {} = isolate, true = child, false/undefined = no change
      controller: function($scope, $element, $attrs, $transclude) {
        $scope.isAscending = true;
        $scope.clicked = function (){
          $scope.isAscending = !$scope.isAscending;
          offerOrderState.orderBy = $scope.orderBy;
          offerOrderState.isAscending = $scope.isAscending;
          $scope.$apply();
        };
      },
      // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
      restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
      template: '<span ng-class="\'order-\' + (isAscending ? \'asc\' : \'desc\')" ng-transclude></span>',
      //templateUrl: '',
      replace: true,
      transclude: true,
      link: function($scope, iElm, iAttrs, controller) {
        iElm.bind('click', function (){
          $scope.clicked();
        });
      }
    };
  }]);
})();
