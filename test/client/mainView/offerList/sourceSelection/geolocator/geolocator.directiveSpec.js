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
    var element, $scope, $parentScope;

    beforeEach(function() {
      var compiled = utils.compile('<geolocator on-location-selected="locationSelected($lat, $lng)" key="a-key" ng-show="ngShowBinding"></geolocator>');
      element = compiled.element;
      $scope = compiled.scope;
      $parentScope = compiled.parentScope;
      $parentScope.ngShowBinding = false;
    });

    it('should load map from service when made visible', function() {
      locatorMap.loadMapScript = jasmine.createSpy('loadMapScript');
      expect(locatorMap.loadMapScript).not.toHaveBeenCalled();

      $scope.$apply(function() {
        $parentScope.ngShowBinding = true;
      });

      expect(locatorMap.loadMapScript).toHaveBeenCalledWith('geolocator-canvas-'+$scope.$id, 'a-key');
    });

    it('should load map from service only the first time', function() {
      locatorMap.loadMapScript = jasmine.createSpy('loadMapScript');

      $scope.$apply(function() {
        $parentScope.ngShowBinding = true;
      });
      $scope.$apply(function() {
        $parentScope.ngShowBinding = false;
      });
      $scope.$apply(function() {
        $parentScope.ngShowBinding = true;
      });

      expect(locatorMap.loadMapScript.calls.count()).toBe(1);
    });

    it('should call parent\'s location selected method with location from service when location selected', function() {
      $parentScope.locationSelected = jasmine.createSpy('locationSelected');
      locatorMap.getLocation = jasmine.createSpy('getLocation').and.returnValue({
        lat: 'lat',
        lng: 'lng',
      });

      $scope.locationSelected();

      expect($parentScope.locationSelected).toHaveBeenCalledWith('lat', 'lng');
    });
  });
});
