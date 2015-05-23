describe('geolocator module', function() {
  'use strict';
  var ngGeolocator, offerSourceService;
  beforeEach(function() {
    module('geolocator', 'partials', function($provide) {
      $provide.provider('ngGeolocator', {
        $get: function() {
          return {};
        }
      });
      $provide.provider('offerSourceService', {
        $get: function() {
          return {};
        }
      });
    });
    inject(function(_ngGeolocator_, _offerSourceService_){
      ngGeolocator = _ngGeolocator_;
      offerSourceService = _offerSourceService_;
    });
  });

  describe('geolocator directive', function() {
    var element, $scope, ctrl, $parentScope, locatorDefer, $timeout;

    beforeEach(inject(function($q, _$timeout_) {
      $timeout = _$timeout_;
      var compiled = utils.compile('<geolocator on-selected="locationSelected()" ng-show="ngShowBinding"></geolocator>');
      element = compiled.element;
      $scope = compiled.scope;
      ctrl = $scope.ctrl;
      $parentScope = compiled.parentScope;
      $parentScope.ngShowBinding = false;
      locatorDefer = $q.defer();
      ngGeolocator.create = jasmine.createSpy('create').and.returnValue(locatorDefer.promise);
    }));

    it('should load map from service when made visible', function() {
      expect(ngGeolocator.create).not.toHaveBeenCalled();

      $scope.$apply(function() {
        $parentScope.ngShowBinding = true;
      });
      $timeout.flush();

      expect(ngGeolocator.create).toHaveBeenCalledWith('geolocator-canvas-'+$scope.$id);
    });

    it('should load map from service only the first time', function() {
      $scope.$apply(function() {
        $parentScope.ngShowBinding = true;
      });
      $timeout.flush();
      $scope.$apply(function() {
        $parentScope.ngShowBinding = false;
      });
      $scope.$apply(function() {
        $parentScope.ngShowBinding = true;
      });

      expect(ngGeolocator.create.calls.count()).toBe(1);
    });

    describe('with the locator resolved', function() {
      beforeEach(function() {
        locatorDefer.resolve({
          getLocation: jasmine.createSpy('getLocation').and.returnValue({
            lat: 'lat',
            lng: 'lng',
          }),
        });
        $parentScope.locationSelected = jasmine.createSpy('locationSelected');
        offerSourceService.update = jasmine.createSpy('updateOfferSource');

        $scope.$apply(function() {
          $parentScope.ngShowBinding = true;
        });
        $timeout.flush();
      });

      it('should mark the controller as ready for locationSelected calls', function() {
        expect(ctrl.ready).toBe(true);
      });

      describe('#locationSelected', function() {
        it('should call parent\'s location selected method when location selected', function() {
          ctrl.locationSelected();

          expect($parentScope.locationSelected).toHaveBeenCalled();
        });

        it('should update the offerSource', function() {
          ctrl.locationSelected();

          expect(offerSourceService.update).toHaveBeenCalledWith({
            location: {
              lat: 'lat',
              lng: 'lng',
            },
          });
        });
      });
    });

    describe('with the geolocator failing to be initialized', function() {
      beforeEach(function() {
        locatorDefer.reject('an error');
        $scope.$apply(function() {
          $parentScope.ngShowBinding = true;
        });
        $timeout.flush();
      });

      it('should NOT mark the controller as ready for locationSelected calls', function() {
        expect(ctrl.ready).not.toBe(true);
      });

      it('should mark the controller to be in an error state', function() {
        expect(ctrl.error).toBe(true);
      });
    });
  });
});

describe('ngGeolocator configuration', function() {
  'use strict';
  var p;
  beforeEach(function(){
    module('ngGeolocator', function(ngGeolocatorProvider) {
      spyOn(ngGeolocatorProvider, 'setGoogleMapsAPIKey');
      spyOn(ngGeolocatorProvider, 'extendLocatorMarkerOptions');
      p = ngGeolocatorProvider;
    });
    module('geolocator');
    inject();
  });

  it('should have set the API key', function() {
    expect(p.setGoogleMapsAPIKey).toHaveBeenCalled();
  });

  it('should have customized the locator marker', function() {
    expect(p.extendLocatorMarkerOptions).toHaveBeenCalled();
    expect(p.extendLocatorMarkerOptions.calls.first().args[0].icon.url).toBeTruthy();
  });
});
