describe('OfferList cotrollers', function() {
  'use strict';
  beforeEach(module('restaurantAdminViewControllers'));

  describe('RestaurantOfferListCtrl', function() {
    var $scope;

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
  });
});
