(function() {
  'use strict';
  var module = angular.module('geolocator', []);

  function Locator(marker, readyPromise) {
    this.marker = marker;
    this.readyPromise = readyPromise;
  }
  Locator.prototype.getLocation = function() {
    var location = this.marker.getPosition();
    return {
      lat: location.lat(),
      lng: location.lng(),
    };
  }

  module.factory('locatorMap', ['$window', '$q', '$timeout',
    function($window, $q, $timeout) {
      var mapsAPIPromise, geolocationPromise;
      function loadMap(canvasID, key) {
        if (!mapsAPIPromise) {
          var mapsDefer = $q.defer();
          mapsAPIPromise = mapsDefer.promise;
          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=googleMapsInitialized';
          if (key) {
            script.src += '&key=' + key;
          }
          $window.googleMapsInitialized = mapsDefer.resolve;
          $window.document.body.appendChild(script);
        }
        return mapsAPIPromise.then(function(){
          var map = initMap(canvasID);
          var locatorMarker = initLocatorMarker(map);
          var readyPromise = centerOnUsersLocation(map, locatorMarker);
          return new Locator(locatorMarker, readyPromise);
        });
      }
      function handleNoGeolocation(map, errorFlag) {
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
      function centerOnUsersLocation(map, locatorMarker) {
        if(!$window.navigator.geolocation) {
          handleNoGeolocation(map, false);
          return $q.reject('Geolocation service not supported.');
        }
        if (!geolocationPromise) {
          var geolocationDefer = $q.defer();
          geolocationPromise = geolocationDefer.promise;
          $window.navigator.geolocation.getCurrentPosition(geolocationDefer.resolve, geolocationDefer.reject);
          var timeoutPromise = $timeout(function(){
            geolocationDefer.reject('Timed out');
          }, 10000);
          geolocationPromise.then(function() {
            $timeout.cancel(timeoutPromise);
          });
        }
        return geolocationPromise.then(function(position) {
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
          locatorMarker.setPosition(pos);

          map.setCenter(pos);
        }, function() {
          handleNoGeolocation(map, true);
          return $q.reject('Geolocation service failed.');
        });
      }
      function initMap(canvasID) {
        var mapOptions = {
          zoom: 17,
        };
        return new $window.google.maps.Map($window.document.getElementById(canvasID), mapOptions);
      }
      function initLocatorMarker(map) {
        return new $window.google.maps.Marker({
          draggable: true,
          zIndex: 3,
          map: map,
        });
      }
      return {
        /**
         * loadMap will initialize google maps, if it isn't already initialized and
         * will then initialize a map on the specified canvasID. Once the user has
         * accepted to share their location the map will be centered to that location
         * and a marker will be displayed that the user can move to confirm/specify
         * their actual location.
         */
        loadMap: loadMap,
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
          var locator;
          $scope.locationSelected = function() {
            var location = locator.getLocation();
            $scope.onLocationSelected({
              $lat: location.lat,
              $lng: location.lng,
            });
          };
          $scope.ready = false;
          var deregister = $scope.$watch('ngShow', function(newVal, oldVal) {
            if (!newVal) {
              return;
            }
            var locatorPromise = locatorMap.loadMap('geolocator-canvas-'+$scope.$id, $scope.key);
            locatorPromise.then(function(_locator_) {
              locator = _locator_;
              locator.readyPromise.then(function() {
                $scope.ready = true;
              });
            });
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
