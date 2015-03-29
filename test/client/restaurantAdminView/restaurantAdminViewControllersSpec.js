describe('OfferList cotrollers', function() {
  'use strict';
  beforeEach(module('restaurantAdminViewControllers'));

  describe('RestaurantAdminViewCtrl', function() {
    var $scope;

    afterEach(inject(function($httpBackend) {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }));

    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $httpBackend.expectGET('api/v1/restaurant').respond(offerUtils.getMockRestaurant());

      $scope = $rootScope.$new();
      $controller('RestaurantAdminViewCtrl', {
        $scope: $scope
      });
    }));

    it('should have restaurant data after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect($scope.restaurant.name).toBeUndefined();
      $httpBackend.flush();
      expect($scope.restaurant.name).toBe('Bulgarian Chef');
    }));

    describe('with the mock restaurant fetched', function() {
      beforeEach(inject(function($httpBackend) {
        $httpBackend.flush();
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
          $scope.postOffer({});

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
            restaurant: $scope.restaurant,
          });

          $scope.postOffer({test: 'a test field'});
          $httpBackend.flush();
        }));
      });
    });
  });

  describe('RestaurantOfferListCtrl', function() {
    var $scope;
    var restaurantId = 'someId';

    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $httpBackend.expectGET('api/v1/restaurant/offers').respond(offerUtils.getMockOffers());

      $scope = $rootScope.$new();
      $rootScope.restaurant = {
        _id: restaurantId
      };
      $controller('RestaurantOfferListCtrl', {
        $scope: $scope
      });
    }));

    it('should have model with 3 offers after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect($scope.offers.length).toBe(0);
      $httpBackend.flush();
      expect($scope.offers.length).toBe(3);
    }));

    describe('with the original offers fetched from the backend', function() {
      beforeEach(inject(function($httpBackend) {
        $httpBackend.flush();
      }));


      describe('$update an offer', function() {
        var originalOffer, changedOffer, response;

        beforeEach(inject(function($httpBackend) {
          originalOffer = $scope.offers[2];
          changedOffer = angular.copy(originalOffer);
          changedOffer.changed = true;
          response = $httpBackend.expectPUT('api/v1/offers/3').respond({});
        }));

        it('should update with data added by the server', inject(function($httpBackend) {
          expect($scope.offers).toContain(originalOffer);
          $scope.updateOffer(originalOffer, changedOffer);

          expect(originalOffer.changed).toBeUndefined();
          expect($scope.offers).toContain(changedOffer);

          $httpBackend.flush();
          expect(originalOffer.changed).toBeUndefined();
          expect($scope.offers).toContain(changedOffer);
          expect($scope.offers).not.toContain(originalOffer);
        }));

        it('should set the offer as confirmationPending while waiting for the backend', inject(function($httpBackend) {
          expect(originalOffer.confirmationPending).toBeFalsy();
          expect(changedOffer.confirmationPending).toBeFalsy();

          $scope.updateOffer(originalOffer, changedOffer);
          expect(originalOffer.confirmationPending).toBeFalsy();
          expect(changedOffer.confirmationPending).toBeTruthy();

          $httpBackend.flush();
          expect(originalOffer.confirmationPending).toBeFalsy();
          expect(changedOffer.confirmationPending).toBeFalsy();
        }));

        it('should return the original offer in case of an error', inject(function($httpBackend) {
          expect($scope.offers).toContain(originalOffer);
          $scope.updateOffer(originalOffer, changedOffer);

          expect($scope.offers).toContain(changedOffer);

          response.respond(500, {});
          $httpBackend.flush();
          expect($scope.offers).toContain(originalOffer);
          expect($scope.offers).not.toContain(changedOffer);
        }));
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
          var nrOfOffers = $scope.offers.length;

          $scope.$broadcast('offer-posted', mockOffer);

          expect($scope.offers.length).toEqual(nrOfOffers + 1);
          expect($scope.offers[0]).toBe(mockOffer);
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
            var nrOfOffers = $scope.offers.length;
            expect($scope.offers[0]).toBe(mockOffer);

            $scope.$apply(function() {
              deferred.reject();
            });

            expect($scope.offers.length).toEqual(nrOfOffers - 1);
            expect($scope.offers[0]).not.toBe(mockOffer);
          });
        });
      });
    });
  });


});
