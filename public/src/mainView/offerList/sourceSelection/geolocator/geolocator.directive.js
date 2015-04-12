(function() {
  'use strict';
  var module = angular.module('geolocator', []);

  module.directive('geolocator', ['$window', '$q',
    function($window, $q) {
      var map;
      function loadMapScript(key) {
        var script = document.createElement('script');
        var mapsDefer = $q.defer();
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=googleMapsInitialized';
        if (key) {
          script.src += '&key=' + key;
        }
        $window.googleMapsInitialized = mapsDefer.resolve;
        $window.document.body.appendChild(script);
        mapsDefer.promise.then(initMap);
      }
      function handleNoGeolocation(errorFlag) {
        var contnet;
        if (errorFlag) {
          content = 'Error: The Geolocation service failed.';
        } else {
          content = 'Error: Your browser doesn\'t support geolocation.';
        }

        var options = {
          map: map,
          position: new $window.google.maps.LatLng(60, 105),
          content: content,
        };

        var infowindow = new $window.google.maps.InfoWindow(options);
        map.setCenter(options.position);
      }
      function initMap() {
        var mapOptions = {
          zoom: 17,
        };
        map = new $window.google.maps.Map($window.document.getElementById('geolocator-canvas'), mapOptions);

        if($window.navigator.geolocation) {
          $window.navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new $window.google.maps.LatLng(position.coords.latitude,
                                             position.coords.longitude);

            var infowindow = new $window.google.maps.InfoWindow({
              map: map,
              position: pos,
              content: 'Location found using HTML5.'
            });

            map.setCenter(pos);
          }, function() {
            handleNoGeolocation(true);
          });
        } else {
          handleNoGeolocation(false);
        }
      }

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
