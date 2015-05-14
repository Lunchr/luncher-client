describe('mainViewController', function() {
  'use strict';
  var offerSourceService;
  beforeEach(function() {
    module('mainViewController', function($provide) {
      $provide.provider('offerSourceService', {
        $get: function() {
          return {
            getCurrent: jasmine.createSpy('getCurrent'),
          };
        }
      });
    });
    inject(function(_offerSourceService_){
      offerSourceService = _offerSourceService_;
    });
  });

  describe('MainViewCtrl', function() {
    var $scope, vm;

    describe('bootstrapping', function() {
      describe('with offer source current value set for a region', function() {
        beforeEach(inject(function($rootScope, $controller, favorites, $httpBackend) {
          offerSourceService.getCurrent.and.returnValue({
            region: 'a-region'
          });

          $scope = $rootScope.$new();
          $controller('MainViewCtrl as vm', {
            $scope: $scope
          });
          vm = $scope.vm;
        }));

        it('should set the offerSource state to that region', inject(function($httpBackend) {
          expect(vm.state.sourceSelectionPopup).toBeFalsy();
          expect(vm.offerSource.region).toBe('a-region');
        }));
      });

      describe('with offer source current value set for location', function() {
        beforeEach(inject(function($rootScope, $controller) {
          offerSourceService.getCurrent.and.returnValue({
            location: true
          });

          $scope = $rootScope.$new();
          $controller('MainViewCtrl as vm', {
            $scope: $scope
          });
          vm = $scope.vm;
        }));

        it('should open the source selection popup with locator enabled', function() {
          expect(vm.state.sourceSelectionPopup).toBe('active');
          expect(vm.offerSource.location).toBe(true);
        });
      });

      describe('with no current offer source value set', function() {
        beforeEach(inject(function($rootScope, $controller) {
          $scope = $rootScope.$new();
          $controller('MainViewCtrl as vm', {
            $scope: $scope
          });
          vm = $scope.vm;
        }));

        it('should open the source selection popup', function() {
          expect(vm.state.sourceSelectionPopup).toBe('active');
          expect(vm.state.isLocationSelectionEnabled).toBeFalsy();
        });
      });
    });
  });
});
