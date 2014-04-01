'use strict';
describe('PhoneCat controllers', function() {
  beforeEach(module('praadApp'));
 
  describe('OfferListCtrl', function(){
 
    it('should create "phones" model with 3 phones', inject(function($controller) {
      var scope = {},
          ctrl = $controller('OfferListCtrl', { $scope: scope });
 
      expect(scope.offers.length).toBe(3);
    }));
  });
});