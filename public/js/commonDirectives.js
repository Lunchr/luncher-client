(function(){
  'use strict';
  var commonDirectives = angular.module('commonDirectives', []);

  commonDirectives.constant('MILLIS_IN_24H', 86400000);

  commonDirectives.factory('millisUntilMidnight', function(){
    return function (date){
      var midnight = new Date(date);
      midnight.setHours(24, 0, 0, 0);
      return midnight - date;
    };
  });

  commonDirectives.directive('date', ['$timeout', '$interval', 'millisUntilMidnight', 'MILLIS_IN_24H',
    function ($timeout, $interval, millisUntilMidnight, MILLIS_IN_24H){
      return {
        scope: {},
        controller: function($scope, $element, $attrs, $transclude) {
          $scope.date = new Date();

          (function setToRefreshEveryMidnight(){
            var timeoutId, intervalId;

            function updateTime() {
              $scope.date = new Date();
            }

            timeoutId = $timeout(function (){
              updateTime();

              intervalId = $interval(function (){
                updateTime();
              }, MILLIS_IN_24H);

              $element.on('$destroy', function() {
                $interval.cancel(intervalId);
              });
            }, millisUntilMidnight(new Date()) + 5);

            $element.on('$destroy', function() {
              $interval.cancel(timeoutId);
            });
          })();
        },
        restrict: 'E',
        templateUrl: 'partials/date.html'
      };
    }]);
})();
