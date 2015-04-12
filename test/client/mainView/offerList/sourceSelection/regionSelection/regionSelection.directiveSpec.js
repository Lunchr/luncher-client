describe('RegionSelection', function() {
  'use strict';
  beforeEach(function() {
    module('regionSelection', 'partials');
  });

  describe('region selection directive', function() {
    var element, $scope, $parentScope, mockRegions;

    beforeEach(inject(function($httpBackend) {
      mockRegions = offerUtils.getMockRegions();
      $httpBackend.expectGET('api/v1/regions').respond(mockRegions);
      var compiled = utils.compile('<region-selection on-region-selected="regionSelected($region)"></region-selection>');
      element = compiled.element;
      $scope = compiled.scope;
      $parentScope = compiled.parentScope;
    }));

    it('should have regions data after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect($scope.regions.length).toBe(0);
      $httpBackend.flush();
      expect($scope.regions.length).toBe(3);
    }));

    describe('with the http requests mock-responded', function() {
      beforeEach(inject(function($httpBackend) {
        $httpBackend.flush();
      }));

      it('should cache the regions request', inject(function($httpBackend) {
        // we'll create another directive and without flushing expect the tags to be resolved
        var compiled = utils.compile('<region-selection></region-selection>');
        expect(compiled.scope.regions.length).toBe(3);
      }));

      describe('onRegionSelected', function() {
        beforeEach(function() {
          $parentScope.regionSelected = jasmine.createSpy('regionSelected');
        });

        it('should call the specified function with $region as the argument when option selected from dropdown', function() {
          element.children().eq(0).removeAttr('selected');
          element.children().eq(3).attr('selected', true);
          element.trigger('change');

          expect($parentScope.regionSelected).toHaveBeenCalled();
          expect($parentScope.regionSelected.calls.mostRecent().args[0]).toEqual(mockRegions[2].name);
        });
      });
    });
  });
});
