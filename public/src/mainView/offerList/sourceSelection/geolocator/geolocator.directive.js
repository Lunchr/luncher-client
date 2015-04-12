(function() {
  'use strict';
  var module = angular.module('geolocator', []);

  module.factory('locatorMap', ['$window', '$q',
    function($window, $q) {
      var map, locator;
      function loadMapScript(canvasID, key) {
        var script = document.createElement('script');
        var mapsDefer = $q.defer();
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=googleMapsInitialized';
        if (key) {
          script.src += '&key=' + key;
        }
        $window.googleMapsInitialized = mapsDefer.resolve;
        $window.document.body.appendChild(script);
        mapsDefer.promise.then(function(){
          initMap(canvasID);
        });
      }
      function handleNoGeolocation(errorFlag) {
        var content;
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
      function centerOnUsersLocation() {
        if(!$window.navigator.geolocation) {
          handleNoGeolocation(false);
          return;
        }
        $window.navigator.geolocation.getCurrentPosition(function(position) {
          var pos = new $window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          var marker = new $window.google.maps.Marker({
            clickable: false,
            cursor: 'pointer',
            draggable: false,
            flat: true,
            icon: {
                url: 'http://chadkillingsworth.github.io/geolocation-marker/images/gpsloc.png',
                size: new $window.google.maps.Size(34, 34),
                scaledSize: new $window.google.maps.Size(17, 17),
                origin: new $window.google.maps.Point(0, 0),
                anchor: new $window.google.maps.Point(8, 8)
            },
            title: 'Current location',
            zIndex: 2,
            position: pos,
            map: map,
          });
          var circle = new $window.google.maps.Circle({
            clickable: false,
            radius: position.coords.accuracy,
            strokeColor: '1bb6ff',
            strokeOpacity: 0.4,
            fillColor: '61a0bf',
            fillOpacity: 0.4,
            strokeWeight: 1,
            zIndex: 1,
            center: pos,
            map: map,
          });
          locator = new $window.google.maps.Marker({
            draggable: true,
            zIndex: 3,
            position: pos,
            map: map,
          });

          map.setCenter(pos);
        }, function() {
          handleNoGeolocation(true);
        });
      }
      function initMap(canvasID) {
        var mapOptions = {
          zoom: 17,
        };
        map = new $window.google.maps.Map($window.document.getElementById(canvasID), mapOptions);
        centerOnUsersLocation();
      }
      return {
        loadMapScript: loadMapScript,
        getLocation: function() {
          var location = locator.getPosition();
          return {
            lat: location.lat(),
            lng: location.lng(),
          };
        },
      };
    }
  ]);

  module.directive('geolocator', ['locatorMap',
    function(locatorMap) {
      return {
        scope: {
          key: '@',
          onLocationSelected: '&',
          ngShow: '=',
        },
        link: function($scope, $element, $attrs) {
          $scope.locationSelected = function() {
            var location = locatorMap.getLocation();
            $scope.onLocationSelected({
              $lat: location.lat,
              $lng: location.lng,
            });
          };
          var deregister = $scope.$watch('ngShow', function(newVal, oldVal) {
            if (!newVal) {
              return;
            }
            locatorMap.loadMapScript('geolocator-canvas', $scope.key);
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
