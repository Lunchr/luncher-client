describe('OfferList cotrollers', function() {
  'use strict';
  beforeEach(module('offerListControllers', function($provide) {
    // mock the favorites service
    $provide.provider('favorites', {
      $get: function() {
        return {
          // have to add this method, otherwise we get an error when the
          // favorites module tries to execute the run block
          refreshCookieExpirations: jasmine.createSpy(),
        };
      }
    });
  }));

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
      }));

      it('should set selected tags to empty list if nothing selected (false)', inject(function(offerFilterState) {
        $scope.tagList[0].selected = false;

        $scope.$apply();

        expect(offerFilterState.selectedTags.length).toBe(0);
      }));

      it('should add selected tag to list', inject(function(offerFilterState) {
        $scope.tagList[1].selected = true;

        $scope.$apply();

        expect(offerFilterState.selectedTags.length).toBe(1);
        expect(offerFilterState.selectedTags[0]).toBe('lind');
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
        }));

        it('should remove from selected tags to list', inject(function(offerFilterState) {
          $scope.tagList[2].selected = false;

          $scope.$apply();

          expect(offerFilterState.selectedTags.length).toBe(1);
          expect(offerFilterState.selectedTags).toContain('lind');
        }));
      });
    });
  });

  describe('OfferListCtrl', function() {
    var $scope;

    beforeEach(inject(function($rootScope, $controller, $httpBackend, favorites) {
      $httpBackend.expectGET('api/v1/offers').respond(offerUtils.getMockOffers());

      $scope = $rootScope.$new();
      $controller('OfferListCtrl', {
        $scope: $scope
      });

      favorites.decorateOffers = jasmine.createSpy();
      favorites.toggleInclusion = jasmine.createSpy();
    }));

    it('should have model with 4 offers after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect($scope.offers.length).toBe(0);
      $httpBackend.flush();
      expect($scope.offers.length).toBe(4);
    }));

    describe('favorites', function() {
      it('should call the decorator after the offers are returned', inject(function($httpBackend, favorites) {
        expect(favorites.decorateOffers).not.toHaveBeenCalled();
        $httpBackend.flush();
        expect(favorites.decorateOffers).toHaveBeenCalledWith($scope.offers);
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
  });
});
