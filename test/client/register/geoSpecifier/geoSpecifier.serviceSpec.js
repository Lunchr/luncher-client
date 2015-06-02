describe('geoSpecifierService', function() {
  'use strict';
  beforeEach(module('geoSpecifierService', function($provide) {
    $provide.constant('googleMapsAPIKey', 'a-test-key');
  }));

  describe('service', function() {
    var service, $window, $rootScope;
    beforeEach(inject(function(geoSpecifierService, _$window_, _$rootScope_) {
      service = geoSpecifierService;
      $window = _$window_;
      $rootScope = _$rootScope_;
      $window.document.body.appendChild = jasmine.createSpy('appendChild');
      $window.document.getElementById = jasmine.createSpy('getElementById');
      delete $window.google;
    }));

    function loadMockMapsAPI() {
      $window.google = {
        maps: {
          Map: jasmine.createSpy('maps.Map').and.returnValue({
            setCenter: jasmine.createSpy('maps.Map.setCenter'),
            fitBounds: jasmine.createSpy('maps.Map.fitBounds'),
          }),
          Marker: jasmine.createSpy('maps.Marker').and.returnValue({
            setPosition: jasmine.createSpy('maps.Marker.setPosition'),
          }),
          Geocoder: jasmine.createSpy('maps.Geocoder').and.returnValue({
            geocode: jasmine.createSpy('maps.Geocoder.geocode'),
          }),
          GeocoderStatus: {
            OK: 'OK',
            notOK: 'whatever',
          }
        },
      };
    }

    function callMapsCallback() {
      loadMockMapsAPI();
      var callback = /callback=([^&]*)/.exec($window.document.body.appendChild.calls.first().args[0].src)[1];
      $window[callback]();
    }

    describe('create', function() {
      describe('loading the Google Maps API', function() {
        var appendChild;
        beforeEach(function() {
          appendChild = $window.document.body.appendChild;
        });

        it('add the google maps API script to body', function() {
          service.create();
          expect(appendChild).toHaveBeenCalled();
          expect(appendChild.calls.first().args[0].src).toMatch('maps.googleapis.com/maps/api/js');
        });

        it('should include the configured key', function() {
          service.create('');
          expect(appendChild.calls.first().args[0].src).toMatch('key=a-test-key');
        });

        describe('with google maps API loaded by someone other than this service', function() {
          beforeEach(function() {
            loadMockMapsAPI();
          });

          it('should\'nt append another async loading script on create', function() {
            service.create();
            expect(appendChild).not.toHaveBeenCalled();
          });
        });

        describe('with API initialized', function() {
          beforeEach(function() {
            service.create('canvas-id');
            callMapsCallback();
          });

          it('shouldn\'t append another async loading script on create', function() {
            appendChild.calls.reset();
            service.create();
            expect(appendChild).not.toHaveBeenCalled();
          });

          it('should create the map on the specified canvas', function() {
            var mockElement = 'mockElement';
            $window.document.getElementById.and.returnValue(mockElement);

            $rootScope.$apply();

            expect($window.document.getElementById).toHaveBeenCalledWith('canvas-id');
            expect($window.google.maps.Map).toHaveBeenCalled();
            var args = $window.google.maps.Map.calls.first().args;
            expect(args[0]).toBe(mockElement);
            expect(args[1].zoom).toBeDefined();
          });
        });
      });

      describe('creating the Specifier, with maps initialized and map available', function() {
        var specifierPromise, position;
        beforeEach(function() {
          specifierPromise = service.create();
          callMapsCallback();
        });

        it('should resolve the promise with a specifier', function() {
          var specifier;
          specifierPromise.then(function(l) {
            specifier = l;
          });
          $rootScope.$apply();
          expect(specifier).toBeDefined();
        });

        describe('with the specifier resolved', function() {
          var specifier;
          beforeEach(function() {
            specifierPromise.then(function(l) {
              specifier = l;
            });
            $rootScope.$apply();
          });

          it('should not be able to provide a location yet', function() {
            expect(function() {
              specifier.getLocation();
            }).toThrow();
          });

          describe('onResized', function() {
            var trigger;
            beforeEach(function() {
              trigger = jasmine.createSpy('trigger');
              $window.google.maps.event = {
                trigger: trigger,
              };
            });

            it('should trigger the resize event on the map', function() {
              specifier.onResized();
              expect(trigger).toHaveBeenCalledWith($window.google.maps.Map(), 'resize');
            });
          });

          describe('setting the address', function() {
            var maps, map, marker, geocoder;
            beforeEach(function() {
              maps = $window.google.maps;
              map = maps.Map();
              maps.Map.calls.reset();
              geocoder = maps.Geocoder();
              maps.Geocoder.calls.reset();
              marker = maps.Marker();
              maps.Marker.calls.reset();
            });

            describe('for the first time', function() {
              it('should initialize the geocoder', function() {
                specifier.setAddress('whatever');
                expect(maps.Geocoder).toHaveBeenCalled();
              });

              it('should geocode the address', function() {
                specifier.setAddress('whatever');
                expect(geocoder.geocode).toHaveBeenCalled();
                var args = geocoder.geocode.calls.first().args;
                var geocoderParams = args[0];
                var callback = args[1];
                expect(geocoderParams.address).toEqual('whatever');
              });

              describe('with geocoding failing', function() {
                beforeEach(function() {
                  specifier.setAddress('whatever');
                  var callback = geocoder.geocode.calls.first().args[1];
                  callback({}, $window.google.maps.GeocoderStatus.notOK);
                });

                it('should not create the marker', function() {
                  $rootScope.$apply();
                  expect(maps.Marker).not.toHaveBeenCalled();
                });
              });

              describe('with geocoding succeeding', function() {
                beforeEach(function() {
                  specifier.setAddress('whatever');
                  var callback = geocoder.geocode.calls.first().args[1];
                  callback([{
                    geometry: {
                      location: 'the location',
                      viewport: 'the viewport',
                    },
                  }], $window.google.maps.GeocoderStatus.OK);
                });

                it('should create the marker', function() {
                  $rootScope.$apply();
                  expect(maps.Marker).toHaveBeenCalled();
                  var markerOptions = maps.Marker.calls.first().args[0];
                  expect(markerOptions.map).toEqual(map);
                  expect(markerOptions.position).toEqual('the location');
                });

                it('should set the map center location and viewport', function() {
                  $rootScope.$apply();
                  expect(map.setCenter).toHaveBeenCalledWith('the location');
                  expect(map.fitBounds).toHaveBeenCalledWith('the viewport');
                });
              });

              describe('with region included', function() {
                it('should geocode tha address including the region', function() {
                  specifier.setAddress('whatever', 'a-region');
                  expect(geocoder.geocode).toHaveBeenCalled();
                  var args = geocoder.geocode.calls.first().args;
                  var geocoderParams = args[0];
                  var callback = args[1];
                  expect(geocoderParams.address).toEqual('whatever');
                  expect(geocoderParams.region).toEqual('a-region');
                });
              });
            });

            describe('with the marker and geocoder already initialized', function() {
              beforeEach(function() {
                specifier.setAddress('whatever');
                var callback = geocoder.geocode.calls.first().args[1];
                callback([{
                  geometry: {
                    location: 'the location',
                    viewport: 'the viewport',
                  },
                }], $window.google.maps.GeocoderStatus.OK);
                $rootScope.$apply();
                maps.Geocoder.calls.reset();
                maps.Map.calls.reset();
                geocoder.geocode.calls.reset();
              });

              it('should NOT re-initialize the geocoder', function() {
                specifier.setAddress('whatever2');
                expect(maps.Geocoder).not.toHaveBeenCalled();
              });

              it('should geocode the address', function() {
                specifier.setAddress('whatever2');
                expect(geocoder.geocode).toHaveBeenCalled();
                var args = geocoder.geocode.calls.first().args;
                var geocoderParams = args[0];
                var callback = args[1];
                expect(geocoderParams.address).toEqual('whatever2');
              });

              describe('with geocoding failing', function() {
                beforeEach(function() {
                  specifier.setAddress('whatever');
                  var callback = geocoder.geocode.calls.first().args[1];
                  callback({}, $window.google.maps.GeocoderStatus.notOK);
                });

                it('should not set the marker position', function() {
                  $rootScope.$apply();
                  expect(marker.setPosition).not.toHaveBeenCalled();
                });
              });

              describe('with geocoding succeeding', function() {
                beforeEach(function() {
                  specifier.setAddress('whatever2');
                  var callback = geocoder.geocode.calls.first().args[1];
                  callback([{
                    geometry: {
                      location: 'the location2',
                      viewport: 'the viewport2',
                    },
                  }], $window.google.maps.GeocoderStatus.OK);
                });

                it('should set the marker position', function() {
                  $rootScope.$apply();
                  expect(marker.setPosition).toHaveBeenCalledWith('the location2');
                });

                it('should set the map center location and viewport', function() {
                  $rootScope.$apply();
                  expect(map.setCenter).toHaveBeenCalledWith('the location2');
                  expect(map.fitBounds).toHaveBeenCalledWith('the viewport2');
                });
              });

              describe('with region included', function() {
                it('should geocode tha address including the region', function() {
                  specifier.setAddress('whatever', 'a-region');
                  expect(geocoder.geocode).toHaveBeenCalled();
                  var args = geocoder.geocode.calls.first().args;
                  var geocoderParams = args[0];
                  var callback = args[1];
                  expect(geocoderParams.address).toEqual('whatever');
                  expect(geocoderParams.region).toEqual('a-region');
                });
              });
            });
          });
        });
      });
    });
  });
});
