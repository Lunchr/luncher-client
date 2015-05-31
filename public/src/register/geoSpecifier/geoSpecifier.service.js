/**
 * @namespace geoSpecifier
 */
(function() {
  'use strict';
  var module = angular.module('geoSpecifierService', [
    'apiKeys',
  ]);

  module.service('geoSpecifierService', ['$window', '$q', 'googleMapsAPIKey', GeoSpecifierService]);

  /**
   * @constructor
   * @memberof geoSpecifier
   *
   * @param {google.maps} maps    - The Google Maps API
   * @param {google.maps.Map} map
   */
  function Specifier($q, maps, map) {
    var geocoder, marker;
    /**
     * @typedef LatLng
     * @type {Object}
     * @property {number} lat - The latitude.
     * @property {number} lng - The longitude.
     * @memberof geoSpecifier
     */

    /**
     * @returns {LatLng} The current user's selected position.
     */
    this.getLocation = function() {
      var location = marker.getPosition();
      return {
        lat: location.lat(),
        lng: location.lng(),
      };
    };
    this.setAddress = function(address, region) {
      geocode(address, region).then(function(geo) {
        if (!marker) {
          marker = createMarker(map, geo.location);
        } else {
          marker.setPosition(geo.location);
        }
        map.setCenter(geo.location);
        map.fitBounds(geo.viewport);
      });
    };
    this.onResized = function() {
      maps.event.trigger(map, 'resize');
    }

    /**
     * @typedef Geometry
     * @type {Object}
     * @property {LatLng} location       - The coordinates
     * @property {LatLngBounds} viewport - The recommended viewport for the returned result
     * @memberof geoSpecifier
     */

    /**
     * Uses the Google Maps API to geocode the given address using the provided
     * region as a bias.
     *
     * @param  {string} address
     * @param  {string} region
     * @return {Promise.<Geometry>} The geocoding result geometry promise
     */
    function geocode(address, region) {
      if (!geocoder) {
        geocoder = new maps.Geocoder();
      }
      var deferred = $q.defer();
      geocoder.geocode({
        address: address,
        region: region,
      }, function(results, status) {
        if (status == maps.GeocoderStatus.OK) {
          deferred.resolve(results[0].geometry);
        } else {
          deferred.reject(status);
        }
      });
      return deferred.promise;
    }

    function createMarker(map, pos) {
      var markerOptions = {
        draggable: true,
        zIndex: 3,
        map: map,
        position: pos,
        icon: {
          url: '/img/geolocator-pointer.svg',
        },
      };
      return new maps.Marker(markerOptions);
    }
  }


  /**
   * @constructor
   * @memberof geoSpecifier
   */
  function GeoSpecifierService($window, $q, googleMapsAPIKey) {
    var mapsAPIPromise;

    /**
     * XXX
     * create will initialize google maps, if it isn't already initialized, and
     * will then draw a map on the specified canvasID. The map will be centered to
     * the geocoded location of the provided address and a marker will be displayed
     * that the user can move to specify the location. This marker will then be
     * used to create a new {@link Specifier} object which will then be used to
     * resolve the returned promise.
     *
     * @param {string} canvasID - The elemt ID of the canvas to load the map onto.
     * @param {string} address  - The address to initially center the map on.
     * @param {string} region   - The ccTLD ("top-level domain") for the address.
     * @returns {Promise.<Specifier>}
     */
    this.create = function(canvasID) {
      return loadMapsAPI().then(function() {
        return initMap(canvasID);
      }).then(function(map) {
        return new Specifier($q, $window.google.maps, map);
      });
    };

    /**
     * Asynchorously loads the Google Maps API by appending it's script to the
     * DOM body element.
     *
     * @returns {Promise} A promise that will be resolved when Google Maps has
     * been initialized.
     */
    function loadMapsAPI() {
      if (mapsAPIPromise) {
        return mapsAPIPromise;
      }
      if (typeof $window.google === 'object' && typeof $window.google.maps === 'object') {
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;
      }
      var mapsDefer = $q.defer();
      mapsAPIPromise = mapsDefer.promise;
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=googleMapsInitialized&key=' + googleMapsAPIKey;
      $window.googleMapsInitialized = mapsDefer.resolve;
      $window.document.body.appendChild(script);
      return mapsAPIPromise;
    }

    function initMap(canvasID) {
      var mapOptions = {
        zoom: 17,
      };
      return new $window.google.maps.Map($window.document.getElementById(canvasID), mapOptions);
    }
  }
})();
