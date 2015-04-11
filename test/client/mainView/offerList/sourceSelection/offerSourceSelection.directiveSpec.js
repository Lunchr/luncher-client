describe('RegionSelection', function() {
  'use strict';
  beforeEach(function() {
    module('sourceSelection', 'partials', function($provide){
      $provide.factory('regionSelectionDirective', function(){ return {}; });
    });
  });

  describe('offer source selection directive', function() {
    var element, $scope, $parentScope;

    beforeEach(inject(function($httpBackend) {
      var compiled = utils.compile('<offer-source-selection on-region-selected="regionSelected($region)"></offer-source-selection>');
      element = compiled.element;
      $scope = compiled.scope;
      $parentScope = compiled.parentScope;
    }));

    describe('onRegionSelected', function() {
      beforeEach(function() {
        $parentScope.regionSelected = jasmine.createSpy('regionSelected');
      });

      it('should call the specified function with $region as the argument when option selected from dropdown', function() {
        $scope.regionSelected('test');

        expect($parentScope.regionSelected).toHaveBeenCalledWith('test');
      });
    });
  });
});
