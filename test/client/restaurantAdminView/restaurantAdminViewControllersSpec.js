describe('OfferList cotrollers', function() {
  'use strict';
  beforeEach(module('restaurantAdminViewControllers'));

  describe('RestaurantOfferListCtrl', function() {
    var $scope;
    var restaurantId = 'someId';

    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $httpBackend.expectGET('api/offers?restaurant=' + restaurantId).respond(offerUtils.getMockOffers());

      $scope = $rootScope.$new();
      $rootScope.restaurant = {
        _id: restaurantId
      }
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
