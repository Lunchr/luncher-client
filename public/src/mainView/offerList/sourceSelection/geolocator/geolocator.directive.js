(function() {
  'use strict';
  var module = angular.module('geolocator', []);

  module.directive('geolocator', ['$window', '$q',
    function($window, $q) {
      function loadMapScript(key) {
        var script = document.createElement('script');
        var mapsDefer = $q.defer();
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=googleMapsInitialized';
        if (key) {
          script.src += '&key=' + key;
        }
        $window.googleMapsInitialized = mapsDefer.resolve;
        document.body.appendChild(script);
        mapsDefer.promise.then(initMap);
      };
      function initMap() {
        var mapOptions = {
          zoom: 17,
          center: new $window.google.maps.LatLng(58.38, 26.72),
        };

        var map = new $window.google.maps.Map(document.getElementById('geolocator-canvas'), mapOptions);
      };

      return {
        scope: {
          key: '@',
          onLocationSelected: '&',
          ngShow: '=',
        },
        link: function($scope, $element, $attrs) {
          var deregister = $scope.$watch('ngShow', function(newVal, oldVal) {
            if (newVal === oldVal || !newVal) {
              return;
            }
            loadMapScript($scope.key);
            // only init the map the first time this directive is made visible
            deregister();
          });
        },
        restrict: 'E',
        templateUrl: 'src/mainView/offerList/sourceSelection/geolocator/geolocator.template.html',
      };
    }
  ]);
})();
