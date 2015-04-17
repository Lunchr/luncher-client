describe('geolocator module', function() {
  'use strict';
  var locatorMap;
  beforeEach(function() {
    module('geolocator', 'partials', function($provide) {
      $provide.provider('locatorMap', {
        $get: function() {
          return {};
        }
      });
    });
    inject(function(_locatorMap_){
      locatorMap = _locatorMap_;
    });
  });

  describe('geolocator directive', function() {
    var element, $scope, $parentScope, locatorDefer;

    beforeEach(inject(function($q) {
      var compiled = utils.compile('<geolocator on-location-selected="locationSelected($lat, $lng)" key="a-key" ng-show="ngShowBinding"></geolocator>');
      element = compiled.element;
      $scope = compiled.scope;
      $parentScope = compiled.parentScope;
      $parentScope.ngShowBinding = false;
      locatorDefer = $q.defer();
      locatorMap.loadMap = jasmine.createSpy('loadMap').and.returnValue(locatorDefer.promise);
    }));

    it('should load map from service when made visible', function() {
      expect(locatorMap.loadMap).not.toHaveBeenCalled();

      $scope.$apply(function() {
        $parentScope.ngShowBinding = true;
      });

      expect(locatorMap.loadMap).toHaveBeenCalledWith('geolocator-canvas-'+$scope.$id, 'a-key');
    });

    it('should load map from service only the first time', function() {
      $scope.$apply(function() {
        $parentScope.ngShowBinding = true;
      });
      $scope.$apply(function() {
        $parentScope.ngShowBinding = false;
      });
      $scope.$apply(function() {
        $parentScope.ngShowBinding = true;
      });

      expect(locatorMap.loadMap.calls.count()).toBe(1);
    });

    it('should call parent\'s location selected method with location from service when location selected', function() {
      $parentScope.locationSelected = jasmine.createSpy('locationSelected');
      locatorDefer.resolve({
        getLocation: jasmine.createSpy('getLocation').and.returnValue({
          lat: 'lat',
          lng: 'lng',
        }),
        readyPromise: {
          then: jasmine.createSpy('readyPromise'),
        },
      });
      $scope.$apply(function() {
        $parentScope.ngShowBinding = true;
      });

      $scope.locationSelected();

      expect($parentScope.locationSelected).toHaveBeenCalledWith('lat', 'lng');
    });
  });
});
