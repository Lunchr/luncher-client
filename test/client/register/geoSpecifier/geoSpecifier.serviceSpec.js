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
      inject(function() {
        $window.google = {
          maps: {
            Map: jasmine.createSpy('maps.Map').and.returnValue({
              setCenter: jasmine.createSpy('maps.Map.setCenter'),
            }),
            LatLng: jasmine.createSpy('maps.LatLng'),
            Size: jasmine.createSpy('maps.Size'),
            Marker: jasmine.createSpy('maps.Marker').and.returnValue({
              setMap: jasmine.createSpy('maps.Marker.setMap'),
            }),
          },
        };
      });
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
          var locatorPromise;
          beforeEach(function() {
            locatorPromise = service.create('canvas-id');
            callMapsCallback();
          });

          it('should\'nt append another async loading script on create', function() {
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
    });
  });
});
