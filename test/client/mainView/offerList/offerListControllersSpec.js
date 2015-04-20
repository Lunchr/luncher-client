describe('OfferList cotrollers', function() {
  'use strict';
  var cookies;
  beforeEach(function() {
    module('offerListControllers', function($provide) {
      $provide.provider('favorites', {
        $get: function() {
          return {
            // have to add this method, otherwise we get an error when the
            // favorites module tries to execute the run block
            refreshCookieExpirations: jasmine.createSpy(),
          };
        }
      });
      $provide.provider('cookies', {
        $get: function() {
          return {
            refreshExpirations: function() {},
            setOfferSource: jasmine.createSpy('setOfferSource'),
            getOfferSource: jasmine.createSpy('getOfferSource'),
            removeOfferSource: jasmine.createSpy('removeOfferSource'),
          };
        }
      });
    });
    inject(function(_cookies_) {
      cookies = _cookies_;
    });
  });

  describe('Search controller', function() {
    var $scope;

    beforeEach(inject(function($rootScope, $controller) {
      $scope = $rootScope.$new();
      $controller('SearchCtrl', {
        $scope: $scope
      });
    }));

    it('should update filter state service', inject(function(offerFilterState) {
      $scope.query = "Who is ...";

      $scope.$apply();

      expect(offerFilterState.query).toBe("Who is ...");
    }));
  });

  describe('TagList controller', function() {
    var $scope;

    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $httpBackend.expectGET('api/v1/tags').respond(offerUtils.getMockTags());

      $scope = $rootScope.$new();
      $controller('TagListCtrl', {
        $scope: $scope
      });
    }));

    it('should have tags after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect($scope.tagList.length).toBe(0);
      $httpBackend.flush();
      expect($scope.tagList.length).toBe(3);
    }));

    describe('tag selection listener', function() {
      beforeEach(inject(function($httpBackend) {
        $httpBackend.flush();
      }));

      it('should set selected tags to empty list if nothing selected (undefined)', inject(function(offerFilterState) {
        $scope.$apply();

        expect(offerFilterState.selectedTags.length).toBe(0);
        expect($scope.selectedTags.length).toBe(0);
      }));

      it('should set selected tags to empty list if nothing selected (false)', inject(function(offerFilterState) {
        $scope.tagList[0].selected = false;

        $scope.$apply();

        expect(offerFilterState.selectedTags.length).toBe(0);
        expect($scope.selectedTags.length).toBe(0);
      }));

      it('should add selected tag to list', inject(function(offerFilterState) {
        $scope.tagList[1].selected = true;

        $scope.$apply();

        expect(offerFilterState.selectedTags.length).toBe(1);
        expect(offerFilterState.selectedTags[0]).toBe('lind');
        expect($scope.selectedTags.length).toBe(1);
        expect($scope.selectedTags[0]).toBe('Linnust');
      }));

      describe('with 2 tags selected', function() {

        beforeEach(function() {
          $scope.tagList[1].selected = true;
          $scope.tagList[2].selected = true;

          $scope.$apply();
        });

        it('should add multiple selected tags to list', inject(function(offerFilterState) {
          expect(offerFilterState.selectedTags.length).toBe(2);
          expect(offerFilterState.selectedTags).toContain('lind');
          expect(offerFilterState.selectedTags).toContain('siga');
          expect($scope.selectedTags.length).toBe(2);
          expect($scope.selectedTags).toContain('Linnust');
          expect($scope.selectedTags).toContain('Seast');
        }));

        it('should remove from selected tags to list', inject(function(offerFilterState) {
          $scope.tagList[2].selected = false;

          $scope.$apply();

          expect(offerFilterState.selectedTags.length).toBe(1);
          expect(offerFilterState.selectedTags).toContain('lind');
          expect($scope.selectedTags.length).toBe(1);
          expect($scope.selectedTags).toContain('Linnust');
        }));
      });
    });
  });

  describe('OfferListCtrl', function() {
    var $scope;

    describe('bootstrapping', function() {
      describe('with offer source cookie set for a region', function() {
        beforeEach(inject(function($rootScope, $controller, favorites, $httpBackend) {
          cookies.getOfferSource.and.returnValue({
            region: 'a-region'
          });
          $httpBackend.expectGET('api/v1/regions/a-region/offers').respond(offerUtils.getMockOffers());

          $scope = $rootScope.$new();
          $controller('OfferListCtrl', {
            $scope: $scope
          });

          favorites.decorateOffers = jasmine.createSpy();
        }));

        it('should load offers for that region', inject(function($httpBackend) {
          expect($scope.offers.length).toBe(0);
          $httpBackend.flush();
          expect($scope.offers.length).toBe(4);
          expect($scope.region).toBe('a-region');
        }));

        it('should set the offerSource state to that region', inject(function($httpBackend) {
          $httpBackend.flush();
          expect($scope.state.sourceSelectionPopup).toBeFalsy();
          expect($scope.state.offerSource.region).toBe('a-region');
        }));
      });

      describe('with offer source cookie set for location', function() {
        beforeEach(inject(function($rootScope, $controller) {
          cookies.getOfferSource.and.returnValue({
            location: true
          });

          $scope = $rootScope.$new();
          $controller('OfferListCtrl', {
            $scope: $scope
          });
        }));

        it('should open the source selection popup with locator enabled', function() {
          expect($scope.state.sourceSelectionPopup).toBe('active');
          expect($scope.state.offerSource.location).toBe(true);
        });
      });
    });

    describe('with no offer source cookie set', function() {
      beforeEach(inject(function($rootScope, $controller, favorites) {
        $scope = $rootScope.$new();
        $controller('OfferListCtrl', {
          $scope: $scope
        });
        $scope.region = 'to-test-that-this-is-removed-for-load-near-location';

        favorites.decorateOffers = jasmine.createSpy();
        favorites.toggleInclusion = jasmine.createSpy();
      }));

      it('should open the source selection popup', function() {
        expect($scope.state.sourceSelectionPopup).toBe('active');
        expect($scope.state.isLocationSelectionEnabled).toBeFalsy();
      });

      describe('loadOffersForRegion', function() {
        it('should have model with 4 offers after we mock-respond to the HTTP request', inject(function($httpBackend) {
          $httpBackend.expectGET('api/v1/regions/tartu/offers').respond(offerUtils.getMockOffers());
          expect($scope.offers).toBeUndefined();
          $scope.loadOffersForRegion('tartu');
          $httpBackend.flush();
          expect($scope.offers.length).toBe(4);
          expect($scope.region).toBe('tartu');
        }));
      });

      describe('loadOffersNearLocation', function() {
        it('should have model with 4 offers after we mock-respond to the HTTP request', inject(function($httpBackend) {
          $httpBackend.expectGET('api/v1/offers?lat=1.1&lng=2.2').respond(offerUtils.getMockOffers());
          expect($scope.offers).toBeUndefined();
          $scope.loadOffersNearLocation(1.1, 2.2);
          $httpBackend.flush();
          expect($scope.offers.length).toBe(4);
          expect($scope.region).toBeUndefined();
        }));

        describe('with load offers for region invoked', function() {
          beforeEach(inject(function($httpBackend) {
            $httpBackend.expectGET('api/v1/offers?lat=1.1&lng=2.2').respond(offerUtils.getMockOffers());
            $scope.loadOffersNearLocation(1.1, 2.2);
          }));

          describe('favorites', function() {
            it('should call the decorator after the offers are returned', inject(function($httpBackend, favorites) {
              expect(favorites.decorateOffers).not.toHaveBeenCalled();
              $httpBackend.flush();
              expect(favorites.decorateOffers).toHaveBeenCalledWith($scope.offers);
            }));
          });
        });
      });

      describe('with load offers for region invoked', function() {
        var mockOffers;
        beforeEach(inject(function($httpBackend) {
          mockOffers = offerUtils.getMockOffers();
          $httpBackend.expectGET('api/v1/regions/tartu/offers').respond(mockOffers);
          $scope.loadOffersForRegion('tartu');
        }));

        describe('favorites', function() {
          beforeEach(function() {
            jasmine.addMatchers(offerUtils.matchers);
          });

          it('should call the decorator after the offers are returned', inject(function($httpBackend, favorites) {
            expect(favorites.decorateOffers).not.toHaveBeenCalled();
            $httpBackend.flush();
            expect(favorites.decorateOffers).toHaveBeenCalledWith($scope.offers);
          }));

          it('should call separate the offers into groups by favorites after offers are returned', inject(function($httpBackend) {
            mockOffers[1].isFavorite = true;
            mockOffers[3].isFavorite = true;
            $httpBackend.flush();

            expect($scope.offersGroupedByIsFavorite.length).toBe(2);
            expect($scope.offersGroupedByIsFavorite[0]).toContainId('2');
            expect($scope.offersGroupedByIsFavorite[0]).toContainId('4');
            expect($scope.offersGroupedByIsFavorite[1]).toContainId('1');
            expect($scope.offersGroupedByIsFavorite[1]).toContainId('3');
          }));

          it('should group all into one with no favorites', inject(function($httpBackend) {
            $httpBackend.flush();

            expect($scope.offersGroupedByIsFavorite.length).toBe(1);
            expect($scope.offersGroupedByIsFavorite[0].length).toBe(4);
          }));

          it('should group all into one with all being favorites', inject(function($httpBackend) {
            mockOffers[0].isFavorite = true;
            mockOffers[1].isFavorite = true;
            mockOffers[2].isFavorite = true;
            mockOffers[3].isFavorite = true;
            $httpBackend.flush();

            expect($scope.offersGroupedByIsFavorite.length).toBe(1);
            expect($scope.offersGroupedByIsFavorite[0].length).toBe(4);
          }));

          describe('toggle restaurant as favorite', function() {
            beforeEach(inject(function(favorites, $httpBackend) {
              $httpBackend.flush();
              favorites.decorateOffers.calls.reset();
            }));

            it('should call the toggle function with the provided restaurant name', inject(function(favorites) {
              var restaurantName = 'mock name';
              expect(favorites.toggleInclusion).not.toHaveBeenCalled();

              $scope.toggleFavorite(restaurantName);

              expect(favorites.toggleInclusion).toHaveBeenCalledWith(restaurantName);
              expect(favorites.decorateOffers).toHaveBeenCalledWith($scope.offers);
            }));
          });
        });

        describe('getLatLng', function() {
          beforeEach(inject(function($httpBackend) {
            $httpBackend.flush();
          }));

          it('should return a string with "lat,lng"', function() {
            var latlng = $scope.getLatLng({
              restaurant: {
                location: {
                  coordinates: [1.2, 2.1],
                },
              },
            });
            expect(latlng).toEqual('2.1,1.2');
          });
        });
      });
    });
  });
});
