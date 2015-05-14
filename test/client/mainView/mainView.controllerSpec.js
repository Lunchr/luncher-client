describe('mainViewController', function() {
  'use strict';
  var offerSourceService;
  beforeEach(function() {
    module('mainViewController', function($provide) {
      $provide.provider('favorites', {
        $get: function() {
          return {
            // have to add this method, otherwise we get an error when the
            // favorites module tries to execute the run block
            refreshCookieExpirations: jasmine.createSpy(),
          };
        }
      });
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

  describe('MainViewCtrl', function() {
    var $scope, vm;

    describe('bootstrapping', function() {
      describe('with offer source current value set for a region', function() {
        beforeEach(inject(function($rootScope, $controller, favorites, $httpBackend) {
          offerSourceService.getCurrent.and.returnValue({
            region: 'a-region'
          });
          $httpBackend.expectGET('api/v1/regions/a-region/offers').respond(offerUtils.getMockOffers());

          $scope = $rootScope.$new();
          $controller('MainViewCtrl as vm', {
            $scope: $scope
          });
          vm = $scope.vm;

          favorites.decorateOffers = jasmine.createSpy();
        }));

        it('should load offers for that region', inject(function($httpBackend) {
          expect(vm.offers.length).toBe(0);
          $httpBackend.flush();
          expect(vm.offers.length).toBe(4);
        }));

        it('should set the offerSource state to that region', inject(function($httpBackend) {
          $httpBackend.flush();
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
    });

    describe('with no offer source current value set', function() {
      beforeEach(inject(function($rootScope, $controller, favorites) {
        $scope = $rootScope.$new();
        $controller('MainViewCtrl as vm', {
          $scope: $scope
        });
        vm = $scope.vm;
        vm.offerSource = {
          region: 'to-test-that-this-is-removed-for-load-near-location',
        };

        favorites.decorateOffers = jasmine.createSpy();
        favorites.toggleInclusion = jasmine.createSpy();
      }));

      it('should open the source selection popup', function() {
        expect(vm.state.sourceSelectionPopup).toBe('active');
        expect(vm.state.isLocationSelectionEnabled).toBeFalsy();
      });

      describe('loadOffersForRegion', function() {
        beforeEach(inject(function($httpBackend) {
          $httpBackend.expectGET('api/v1/regions/tartu/offers').respond(offerUtils.getMockOffers());
        }));

        it('should have model with 4 offers after we mock-respond to the HTTP request', inject(function($httpBackend) {
          expect(vm.offers).toBeUndefined();

          updateOfferSource({
            region: 'tartu',
          });
          $httpBackend.flush();

          expect(vm.offers.length).toBe(4);
          expect(vm.offerSource.region).toBe('tartu');
        }));
      });

      describe('loadOffersNearLocation', function() {
        beforeEach(inject(function($httpBackend) {
          $httpBackend.expectGET('api/v1/offers?lat=1.1&lng=2.2').respond(offerUtils.getMockOffers());
        }));

        it('should have model with 4 offers after we mock-respond to the HTTP request', inject(function($httpBackend) {
          expect(vm.offers).toBeUndefined();

          updateOfferSource({
            location: {
              lat: 1.1,
              lng: 2.2,
            },
          });
          $httpBackend.flush();

          expect(vm.offers.length).toBe(4);
          expect(vm.offerSource.region).toBeUndefined();
          expect(vm.offerSource.location).toBeTruthy();
        }));

        describe('with load offers for region invoked', function() {
          beforeEach(function() {
            updateOfferSource({
              location: {
                lat: 1.1,
                lng: 2.2,
              },
            });
          });

          describe('favorites', function() {
            it('should call the decorator after the offers are returned', inject(function($httpBackend, favorites) {
              expect(favorites.decorateOffers).not.toHaveBeenCalled();
              $httpBackend.flush();
              expect(favorites.decorateOffers).toHaveBeenCalledWith(vm.offers);
            }));
          });
        });
      });

      describe('with load offers for region invoked', function() {
        var mockOffers;
        beforeEach(inject(function($httpBackend) {
          mockOffers = offerUtils.getMockOffers();
          $httpBackend.expectGET('api/v1/regions/tartu/offers').respond(mockOffers);
          var callback = offerSourceService.subscribeToChanges.calls.mostRecent().args[1];
          callback({
            region: 'tartu',
          });
        }));

        describe('favorites', function() {
          beforeEach(function() {
            jasmine.addMatchers(offerUtils.matchers);
          });

          it('should call the decorator after the offers are returned', inject(function($httpBackend, favorites) {
            expect(favorites.decorateOffers).not.toHaveBeenCalled();
            $httpBackend.flush();
            expect(favorites.decorateOffers).toHaveBeenCalledWith(vm.offers);
          }));

          it('should call separate the offers into groups by favorites after offers are returned', inject(function($httpBackend) {
            mockOffers[1].restaurant.isFavorite = true;
            mockOffers[3].restaurant.isFavorite = true;
            $httpBackend.flush();

            expect(vm.offersGroupedByIsFavorite.length).toBe(2);
            expect(vm.offersGroupedByIsFavorite[0]).toContainId('2');
            expect(vm.offersGroupedByIsFavorite[0]).toContainId('4');
            expect(vm.offersGroupedByIsFavorite[1]).toContainId('1');
            expect(vm.offersGroupedByIsFavorite[1]).toContainId('3');
          }));

          it('should group all into one with no favorites', inject(function($httpBackend) {
            $httpBackend.flush();

            expect(vm.offersGroupedByIsFavorite.length).toBe(1);
            expect(vm.offersGroupedByIsFavorite[0].length).toBe(4);
          }));

          it('should group all into one with all being favorites', inject(function($httpBackend) {
            mockOffers[0].restaurant.isFavorite = true;
            mockOffers[1].restaurant.isFavorite = true;
            mockOffers[2].restaurant.isFavorite = true;
            mockOffers[3].restaurant.isFavorite = true;
            $httpBackend.flush();

            expect(vm.offersGroupedByIsFavorite.length).toBe(1);
            expect(vm.offersGroupedByIsFavorite[0].length).toBe(4);
          }));

          describe('toggle restaurant as favorite', function() {
            beforeEach(inject(function(favorites, $httpBackend) {
              $httpBackend.flush();
              favorites.decorateOffers.calls.reset();
            }));

            it('should call the toggle function with the provided restaurant name', inject(function(favorites) {
              var restaurantName = 'mock name';
              expect(favorites.toggleInclusion).not.toHaveBeenCalled();

              vm.toggleFavorite(restaurantName);

              expect(favorites.toggleInclusion).toHaveBeenCalledWith(restaurantName);
              expect(favorites.decorateOffers).toHaveBeenCalledWith(vm.offers);
            }));
          });
        });

        describe('getLatLng', function() {
          beforeEach(inject(function($httpBackend) {
            $httpBackend.flush();
          }));

          it('should return a string with "lat,lng"', function() {
            var latlng = vm.getLatLng({
              restaurant: {
                location: {
                  coordinates: [1.2, 2.1],
                },
              },
            });
            expect(latlng).toEqual('2.1,1.2');
          });
        });

        describe('grouping by restaurant', function() {
          var offers = [
            {restaurant:{name:'resto1'}},
            {restaurant:{name:'resto2'}},
            {restaurant:{name:'resto2'}},
            {restaurant:{name:'resto3'}},
          ];

          describe('isFirstForRestaurant', function() {
            it('should return true for first offer', function() {
              expect(vm.isFirstForRestaurant(offers, offers[0])).toBe(true);
            });

            it('should return true for first offer for resto', function() {
              expect(vm.isFirstForRestaurant(offers, offers[1])).toBe(true);
              expect(vm.isFirstForRestaurant(offers, offers[3])).toBe(true);
            });

            it('should return false for second offer for resto', function() {
              expect(vm.isFirstForRestaurant(offers, offers[2])).toBe(false);
            });
          });

          describe('isLastForRestaurant', function() {
            it('should return true for last offer', function() {
              expect(vm.isLastForRestaurant(offers, offers[3])).toBe(true);
            });

            it('should return true for last offer for resto', function() {
              expect(vm.isLastForRestaurant(offers, offers[0])).toBe(true);
              expect(vm.isLastForRestaurant(offers, offers[2])).toBe(true);
            });

            it('should return false for first offer for resto, if more following', function() {
              expect(vm.isLastForRestaurant(offers, offers[1])).toBe(false);
            });
          });
        });
      });
    });

    function updateOfferSource(offerSource) {
      var callback = offerSourceService.subscribeToChanges.calls.mostRecent().args[1];
      callback(offerSource);
    }
  });
});
