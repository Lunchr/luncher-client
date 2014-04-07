describe('OfferList sorters', function() {
  'use strict';
  beforeEach(module('offerListSorters'));

  it('should have order state', inject(function (offerOrderState) {
    expect(offerOrderState).toBeDefined();
  }));

  describe('with order state', function () {
    var offers;

    beforeEach(inject(function (offerOrderState) {
      offers = offerUtils.getMockOffers();
      utils.pruneObject(offerOrderState);
      this.addMatchers(offerUtils.matchers);
    }));

    describe('offer sorter directive', function() {
      var element, $scope;
      beforeEach(inject(function ($compile, $rootScope){
        $scope = $rootScope.$new();
        element = angular.element('<sorter>{{2+2}}</sorter>');
        $compile(element)($scope);
      }));

      it('should contain \'4\'', function() {
        $scope.$digest();
        expect(element.html()).toBe('4');
      });

    });

  });
});
