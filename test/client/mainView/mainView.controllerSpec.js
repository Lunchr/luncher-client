describe('mainViewController', function() {
  'use strict';
  var offerSourceService;
  beforeEach(function() {
    module('mainViewController', function($provide) {
      $provide.provider('offerSourceService', {
        $get: function() {
          return {
            subscribeToChanges: jasmine.createSpy('subscribeToChanges'),
            getCurrent: jasmine.createSpy('getCurrent'),
            update: jasmine.createSpy('update'),
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

        context('with Tallinn available as one of the sources', function() {
          beforeEach(inject(function($httpBackend) {
            $httpBackend.expectGET('api/v1/regions').respond([
              {
                name: 'Tartu'
              }, {
                name: 'Tallinn'
              }
            ]);
            $httpBackend.flush();
          }));

          it('should select Tallinn region', function() {
            expect(vm.state.sourceSelectionPopup).not.toBe('active');
            expect(vm.state.isLocationSelectionEnabled).toBeFalsy();
            expect(offerSourceService.update).toHaveBeenCalledWith({
              region: 'Tallinn',
            });
          });
        });

        context('without Tallinn available as one of the sources', function() {
          beforeEach(inject(function($httpBackend) {
            $httpBackend.expectGET('api/v1/regions').respond([
              {
                name: 'Tartu'
              }, {
                name: 'NotTallinn'
              }
            ]);
            $httpBackend.flush();
          }));

          it('should open the source selection popup', function() {
            expect(vm.state.sourceSelectionPopup).toBe('active');
            expect(vm.state.isLocationSelectionEnabled).toBeFalsy();
          });
        });

        it('should keep offer source up to date', function() {
          updateOfferSource({
            test: true,
          });

          expect(vm.offerSource.test).toBe(true);
        });
      });
    });

    function updateOfferSource(offerSource) {
      var callback = offerSourceService.subscribeToChanges.calls.mostRecent().args[1];
      callback(offerSource);
    }
  });
});
