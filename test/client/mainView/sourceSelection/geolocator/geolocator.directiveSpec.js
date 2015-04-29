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
      var compiled = utils.compile('<geolocator on-selected="locationSelected()" key="a-key" ng-show="ngShowBinding"></geolocator>');
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

      expect(ngGeolocator.create).toHaveBeenCalledWith('geolocator-canvas-'+$scope.$id, 'a-key');
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
      });

      it('should call parent\'s location selected method when location selected', function() {
        $scope.$apply(function() {
          $parentScope.ngShowBinding = true;
        });
        $timeout.flush();
        ctrl.locationSelected();

        expect($parentScope.locationSelected).toHaveBeenCalled();
      });

      it('should update the offerSource', function() {
        $scope.$apply(function() {
          $parentScope.ngShowBinding = true;
        });
        $timeout.flush();
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
});
