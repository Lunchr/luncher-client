describe('RegionSelection', function() {
  'use strict';
  var offerSourceService;
  beforeEach(function() {
    module('regionSelection', 'partials', function($provide) {
      $provide.provider('offerSourceService', {
        $get: function() {
          return {
            subscribeToChanges: jasmine.createSpy('subscribeToChanges'),
            getCurrent: jasmine.createSpy('getCurrent'),
          };
        }
      });
    });
    inject(function(_offerSourceService_){
      offerSourceService = _offerSourceService_;
    });
  });

  describe('region selection directive', function() {
    var element, $scope, ctrl, $parentScope, mockRegions;

    beforeEach(inject(function($httpBackend) {
      mockRegions = offerUtils.getMockRegions();
      $httpBackend.expectGET('api/v1/regions').respond(mockRegions);
      var compiled = utils.compile('<region-selection on-selected="regionSelected()"></region-selection>');
      element = compiled.element;
      $scope = compiled.scope;
      ctrl = $scope.ctrl;
      $parentScope = compiled.parentScope;
    }));

    it('should have regions data after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect(ctrl.regions.length).toBe(0);
      $httpBackend.flush();
      expect(ctrl.regions.length).toBe(3);
    }));

    describe('with the http requests mock-responded', function() {
      beforeEach(inject(function($httpBackend) {
        $httpBackend.flush();
      }));

      it('should cache the regions request', function() {
        // we'll create another directive and without flushing expect the tags to be resolved
        var compiled = utils.compile('<region-selection></region-selection>');
        expect(compiled.scope.ctrl.regions.length).toBe(3);
      });

      it('should init with current state from the offer source service', function() {
        offerSourceService.getCurrent.and.returnValue({
          region: 'test',
        });
        var compiled = utils.compile('<region-selection></region-selection>');
        expect(compiled.scope.ctrl.selected).toBe('test');
      });

      it('should update when offer source changes', function() {
        var callback = offerSourceService.subscribeToChanges.calls.mostRecent().args[1];
        callback({
          region: 'updated',
        });
        expect(ctrl.selected).toBe('updated');
      });

      describe('onRegionSelected', function() {
        beforeEach(function() {
          $parentScope.regionSelected = jasmine.createSpy('regionSelected');
          offerSourceService.update = jasmine.createSpy('updateOfferSource');
        });

        it('should call the specified function when option selected from dropdown', function() {
          element.find('input').eq(2).click().trigger('click');

          expect($parentScope.regionSelected).toHaveBeenCalled();
        });

        it('should update the offerSource', function() {
          element.find('input').eq(2).click().trigger('click');

          expect(offerSourceService.update).toHaveBeenCalledWith({
            region: mockRegions[2].name,
          });
        });
      });
    });
  });
});
