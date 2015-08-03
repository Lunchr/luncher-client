describe('Restaurant admin view', function() {
  'use strict';
  beforeEach(module('restaurantAdminViewControllers', function($provide) {
    $provide.provider('restaurant', {
      $get: function() {
        return offerUtils.getMockRestaurant();
      }
    });
  }));

  describe('RestaurantAdminViewCtrl', function() {
    var vm, $scope;

    afterEach(inject(function($httpBackend) {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }));

    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $scope = $rootScope.$new();
      $controller('RestaurantAdminViewCtrl as vm', {
        $scope: $scope
      });
      vm = $scope.vm;
    }));

    it('should have restaurant data after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect(vm.restaurant.name).toBe('Bulgarian Chef');
    }));

    describe('postOffer', function() {
      var postedOffer;

      beforeEach(inject(function($httpBackend) {
        spyOn($scope, '$broadcast');
        postedOffer = {
          id: 'mocked response from the backend'
        };
        $httpBackend.whenPOST('api/v1/offers').respond(postedOffer);
      }));

      it('should broadcast the data returned from the POST', inject(function($httpBackend) {
        vm.postOffer({});

        expect($scope.$broadcast).toHaveBeenCalled();
        var args = $scope.$broadcast.calls.mostRecent().args;
        var channelName = args[0];
        var data = args[1];
        expect(channelName).toEqual('offer-posted');

        expect(data.id).toBeUndefined();
        $httpBackend.flush();
        expect(data.id).toEqual(postedOffer.id);
      }));

      it('should post the combined offer', inject(function($httpBackend) {
        $httpBackend.expectPOST('api/v1/offers', {
          test: 'a test field',
          restaurant: vm.restaurant,
        });

        vm.postOffer({test: 'a test field'});
        $httpBackend.flush();
      }));
    });
  });

  describe('RestaurantOfferListCtrl', function() {
    var vm, $scope;
    var restaurantId = 'someId';

    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $httpBackend.expectGET('api/v1/restaurant/offers').respond(offerUtils.getMockOffers());

      $scope = $rootScope.$new();
      $rootScope.restaurant = {
        _id: restaurantId
      };
      $controller('RestaurantOfferListCtrl as vm', {
        $scope: $scope
      });
      vm = $scope.vm;
    }));

    it('should have model with offers after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect(vm.offers.length).toBe(0);
      $httpBackend.flush();
      expect(vm.offers.length).toBe(4);
    }));

    describe('with the original offers fetched from the backend', function() {
      beforeEach(inject(function($httpBackend) {
        $httpBackend.flush();
      }));

      it('should group offers by date', function() {
        expect(vm.offersByDate.length).toBe(3);
        // new Date(...) sets the time to 00:00 in UTC, but the setHours forces it to 00:00 in the local timezone
        expect(vm.offersByDate[0].date.getTime()).toEqual(new Date('2016-11-11').setHours(0, 0, 0, 0));
        expect(vm.offersByDate[0].offers.length).toBe(2);
        expect(vm.offersByDate[1].date.getTime()).toEqual(new Date('2016-11-12').setHours(0, 0, 0, 0));
        expect(vm.offersByDate[1].offers.length).toBe(1);
        expect(vm.offersByDate[2].date.getTime()).toEqual(new Date('2016-11-13').setHours(0, 0, 0, 0));
        expect(vm.offersByDate[2].offers.length).toBe(1);
      });

      describe('$update an offer', function() {
        var originalOffer, changedOffer, response;

        beforeEach(inject(function($httpBackend) {
          originalOffer = vm.offers[2];
          changedOffer = angular.copy(originalOffer);
          changedOffer.changed = true;
          response = $httpBackend.expectPUT('api/v1/offers/3').respond({});
        }));

        it('should update with data added by the server', inject(function($httpBackend) {
          expect(vm.offers).toContain(originalOffer);
          vm.updateOffer(originalOffer, changedOffer);

          expect(originalOffer.changed).toBeUndefined();
          expect(vm.offers).toContain(changedOffer);

          $httpBackend.flush();
          expect(originalOffer.changed).toBeUndefined();
          expect(vm.offers).toContain(changedOffer);
          expect(vm.offers).not.toContain(originalOffer);
        }));

        it('should set the offer as confirmationPending while waiting for the backend', inject(function($httpBackend) {
          expect(originalOffer.confirmationPending).toBeFalsy();
          expect(changedOffer.confirmationPending).toBeFalsy();

          vm.updateOffer(originalOffer, changedOffer);
          expect(originalOffer.confirmationPending).toBeFalsy();
          expect(changedOffer.confirmationPending).toBeTruthy();

          $httpBackend.flush();
          expect(originalOffer.confirmationPending).toBeFalsy();
          expect(changedOffer.confirmationPending).toBeFalsy();
        }));

        it('should return the original offer in case of an error', inject(function($httpBackend) {
          expect(vm.offers).toContain(originalOffer);
          vm.updateOffer(originalOffer, changedOffer);

          expect(vm.offers).toContain(changedOffer);

          response.respond(500, {});
          $httpBackend.flush();
          expect(vm.offers).toContain(originalOffer);
          expect(vm.offers).not.toContain(changedOffer);
        }));
      });

      describe('$delete an offer', function() {
        var offer;
        beforeEach(inject(function($httpBackend, $window) {
          offer = vm.offers[2];
        }));

        describe('with user declining the confirmation', function() {
          var confirm;
          beforeEach(inject(function($window) {
            confirm = jasmine.createSpy('confirm').and.returnValue(false);
            $window.confirm = confirm;
          }));

          it('should not send a request to the API', inject(function($httpBackend) {
            vm.deleteOffer({});

            expect(confirm).toHaveBeenCalled();
            $httpBackend.verifyNoOutstandingRequest();
          }));
        });

        describe('with the user accepting the confirmation', function() {
          var response;

          beforeEach(inject(function($httpBackend, $window) {
            offer = vm.offers[2];
            response = $httpBackend.expectDELETE('api/v1/offers/3').respond({});
            $window.confirm = jasmine.createSpy('confirm').and.returnValue(true);
          }));

          it('should delete the offer when server succeeds', inject(function($httpBackend) {
            expect(vm.offers).toContain(offer);

            vm.deleteOffer(offer);
            expect(vm.offers).toContain(offer);

            $httpBackend.flush();
            expect(vm.offers).not.toContain(offer);
          }));

          it('should set the offer as confirmationPending while waiting for the backend', inject(function($httpBackend) {
            expect(offer.confirmationPending).toBeFalsy();

            vm.deleteOffer(offer);
            expect(offer.confirmationPending).toBeTruthy();

            $httpBackend.flush();
            expect(offer.confirmationPending).toBeFalsy();
          }));

          it('should set hasWarning in case of an error', inject(function($httpBackend) {
            expect(vm.offers).toContain(offer);

            vm.deleteOffer(offer);
            response.respond(500, {});
            $httpBackend.flush();

            expect(vm.offers).toContain(offer);
            expect(offer.hasWarning).toBe(true);
          }));
        });
      });

      describe('$on(\'offer-posted\') listener', function() {
        var mockOffer, deferred;

        beforeEach(inject(function($q) {
          deferred = $q.defer();
          mockOffer = {
            $promise: deferred.promise,
          };
        }));

        it('should prepend a broadcasted offer into the list of offers', function() {
          var nrOfOffers = vm.offers.length;

          $scope.$broadcast('offer-posted', mockOffer);

          expect(vm.offers.length).toEqual(nrOfOffers + 1);
          expect(vm.offers[0]).toBe(mockOffer);
        });

        describe('with the offer prepended to the list of offers', function() {
          beforeEach(function() {
            $scope.$broadcast('offer-posted', mockOffer);
          });

          it('should mark the offer as confirmed when promise is resolved', function() {
            expect(mockOffer.confirmationPending).toBeTruthy();

            $scope.$apply(function() {
              deferred.resolve();
            });

            expect(mockOffer.confirmationPending).toBeFalsy();
          });

          it('should remove the offer from the list if promise is rejected', function() {
            var nrOfOffers = vm.offers.length;
            expect(vm.offers[0]).toBe(mockOffer);

            $scope.$apply(function() {
              deferred.reject();
            });

            expect(vm.offers.length).toEqual(nrOfOffers - 1);
            expect(vm.offers[0]).not.toBe(mockOffer);
          });
        });
      });
    });
  });


});
