describe('Restaurant admin view', function() {
  'use strict';
  beforeEach(module('restaurantAdminViewControllers', function($provide) {
    $provide.provider('restaurant', {
      $get: function() {
        return offerUtils.getMockRestaurant();
      }
    });
    $provide.provider('restaurants', {
      $get: function() {
        return [offerUtils.getMockRestaurant()];
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
        $httpBackend.whenPOST('api/v1/restaurants/3/offers').respond(postedOffer);
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
        $httpBackend.expectPOST('api/v1/restaurants/3/offers', {
          test: 'a test field',
          restaurant: vm.restaurant,
        });

        vm.postOffer({test: 'a test field'});
        $httpBackend.flush();
      }));
    });
  });

  describe('RestaurantOfferListCtrl', function() {
    var ctrl, $scope;
    var restaurantId = '1337';

    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $httpBackend.expectGET('api/v1/restaurants/1337/offers').respond(offerUtils.getMockOffers());

      $scope = $rootScope.$new();
      $rootScope.restaurant = {
        _id: restaurantId
      };
      $scope.vm = $rootScope;
      $controller('RestaurantOfferListCtrl as ctrl', {
        $scope: $scope
      });
      ctrl = $scope.ctrl;
    }));

    it('should have model with offers after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect(ctrl.offers.length).toBe(0);
      $httpBackend.flush();
      expect(ctrl.offers.length).toBe(4);
    }));

    describe('with the original offers fetched from the backend', function() {
      beforeEach(inject(function($httpBackend) {
        $httpBackend.flush();
      }));

      it('should group offers by date', function() {
        expect(ctrl.offersByDate.length).toBe(3);
        // new Date(...) sets the time to 00:00 in UTC, but the setHours forces it to 00:00 in the local timezone
        expect(ctrl.offersByDate[0].date.getTime()).toEqual(new Date('2016-11-11').setHours(0, 0, 0, 0));
        expect(ctrl.offersByDate[0].offers.length).toBe(2);
        expect(ctrl.offersByDate[0].fbPostTime).toEqual(new Date('2016-11-11T10:15:00.000Z'));
        expect(ctrl.offersByDate[1].date.getTime()).toEqual(new Date('2016-11-12').setHours(0, 0, 0, 0));
        expect(ctrl.offersByDate[1].offers.length).toBe(1);
        expect(ctrl.offersByDate[1].fbPostTime).toEqual(new Date('2016-11-12T10:45:00.000Z'));
        expect(ctrl.offersByDate[2].date.getTime()).toEqual(new Date('2016-11-13').setHours(0, 0, 0, 0));
        expect(ctrl.offersByDate[2].offers.length).toBe(1);
        expect(ctrl.offersByDate[2].fbPostTime).toEqual(new Date('2016-11-13T10:45:00.000Z'));
      });

      describe('$update an offer', function() {
        var originalOffer, changedOffer, response;

        beforeEach(inject(function($httpBackend) {
          originalOffer = ctrl.offers[2];
          changedOffer = angular.copy(originalOffer);
          changedOffer.changed = true;
          response = $httpBackend.expectPUT('api/v1/restaurants/1337/offers/3').respond({});
        }));

        it('should update with data added by the server', inject(function($httpBackend) {
          expect(ctrl.offers).toContain(originalOffer);
          ctrl.updateOffer(originalOffer, changedOffer);

          expect(originalOffer.changed).toBeUndefined();
          expect(ctrl.offers).toContain(changedOffer);

          $httpBackend.flush();
          expect(originalOffer.changed).toBeUndefined();
          expect(ctrl.offers).toContain(changedOffer);
          expect(ctrl.offers).not.toContain(originalOffer);
        }));

        it('should set the offer as confirmationPending while waiting for the backend', inject(function($httpBackend) {
          expect(originalOffer.confirmationPending).toBeFalsy();
          expect(changedOffer.confirmationPending).toBeFalsy();

          ctrl.updateOffer(originalOffer, changedOffer);
          expect(originalOffer.confirmationPending).toBeFalsy();
          expect(changedOffer.confirmationPending).toBeTruthy();

          $httpBackend.flush();
          expect(originalOffer.confirmationPending).toBeFalsy();
          expect(changedOffer.confirmationPending).toBeFalsy();
        }));

        it('should return the original offer in case of an error', inject(function($httpBackend) {
          expect(ctrl.offers).toContain(originalOffer);
          ctrl.updateOffer(originalOffer, changedOffer);

          expect(ctrl.offers).toContain(changedOffer);

          response.respond(500, {});
          $httpBackend.flush();
          expect(ctrl.offers).toContain(originalOffer);
          expect(ctrl.offers).not.toContain(changedOffer);
        }));
      });

      describe('$delete an offer', function() {
        var offer;
        beforeEach(inject(function($httpBackend, $window) {
          offer = ctrl.offers[2];
        }));

        describe('with user declining the confirmation', function() {
          var confirm;
          beforeEach(inject(function($window) {
            confirm = jasmine.createSpy('confirm').and.returnValue(false);
            $window.confirm = confirm;
          }));

          it('should not send a request to the API', inject(function($httpBackend) {
            ctrl.deleteOffer({});

            expect(confirm).toHaveBeenCalled();
            $httpBackend.verifyNoOutstandingRequest();
          }));
        });

        describe('with the user accepting the confirmation', function() {
          var response;

          beforeEach(inject(function($httpBackend, $window) {
            offer = ctrl.offers[2];
            response = $httpBackend.expectDELETE('api/v1/restaurants/1337/offers/3').respond({});
            $window.confirm = jasmine.createSpy('confirm').and.returnValue(true);
          }));

          it('should delete the offer when server succeeds', inject(function($httpBackend) {
            expect(ctrl.offers).toContain(offer);

            ctrl.deleteOffer(offer);
            expect(ctrl.offers).toContain(offer);

            $httpBackend.flush();
            expect(ctrl.offers).not.toContain(offer);
          }));

          it('should set the offer as confirmationPending while waiting for the backend', inject(function($httpBackend) {
            expect(offer.confirmationPending).toBeFalsy();

            ctrl.deleteOffer(offer);
            expect(offer.confirmationPending).toBeTruthy();

            $httpBackend.flush();
            expect(offer.confirmationPending).toBeFalsy();
          }));

          it('should set hasWarning in case of an error', inject(function($httpBackend) {
            expect(ctrl.offers).toContain(offer);

            ctrl.deleteOffer(offer);
            response.respond(500, {});
            $httpBackend.flush();

            expect(ctrl.offers).toContain(offer);
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
          var nrOfOffers = ctrl.offers.length;

          $scope.$broadcast('offer-posted', mockOffer);

          expect(ctrl.offers.length).toEqual(nrOfOffers + 1);
          expect(ctrl.offers[0]).toBe(mockOffer);
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
            var nrOfOffers = ctrl.offers.length;
            expect(ctrl.offers[0]).toBe(mockOffer);

            $scope.$apply(function() {
              deferred.reject();
            });

            expect(ctrl.offers.length).toEqual(nrOfOffers - 1);
            expect(ctrl.offers[0]).not.toBe(mockOffer);
          });
        });
      });
    });
  });
});
