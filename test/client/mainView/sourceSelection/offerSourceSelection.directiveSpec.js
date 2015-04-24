describe('OfferSourceSelection', function() {
  'use strict';
  var offerSourceService;
  beforeEach(function() {
    module('sourceSelection', 'partials', function($provide){
      $provide.factory('regionSelectionDirective', function(){ return {}; });
      $provide.factory('geolocator', function(){ return {}; });
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

  describe('directive', function() {
    var element, $scope, ctrl, $parentScope;

    beforeEach(function() {
      var compiled = utils.compile('<offer-source-selection on-selected="onSelected()"></offer-source-selection>');
      element = compiled.element;
      $scope = compiled.scope;
      ctrl = $scope.ctrl;
      $parentScope = compiled.parentScope;
    });

    describe('onSelected', function() {
      beforeEach(function() {
        $parentScope.onSelected = jasmine.createSpy('onSelected');
      });

      it('should call the specified function option selected from dropdown', function() {
        ctrl.onSelected();

        expect($parentScope.onSelected).toHaveBeenCalled();
      });
    });

    it('should init locationSelected with false if no current state in offerSourceService', function() {
      expect(ctrl.locationSelected).toBeFalsy();
    });

    it('should init locationSelected with false if region selected in offerSourceService', function() {
      offerSourceService.getCurrent.and.returnValue({
        region: 'test',
      });
      var compiled = utils.compile('<offer-source-selection></offer-source-selection>');
      expect(compiled.scope.ctrl.locationSelected).toBeFalsy();
    });

    it('should init with current state from the offer source service', function() {
      offerSourceService.getCurrent.and.returnValue({
        location: 'test',
      });
      var compiled = utils.compile('<offer-source-selection></offer-source-selection>');
      expect(compiled.scope.ctrl.locationSelected).toBeTruthy();
    });

    it('should update when offer source changes', function() {
      var callback = offerSourceService.subscribeToChanges.calls.mostRecent().args[1];
      callback({
        location: 'whatever',
      });
      expect(ctrl.locationSelected).toBeTruthy();
    });
  });
});
