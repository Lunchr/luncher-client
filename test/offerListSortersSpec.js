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
      var element, scope, parentScope;
      beforeEach(inject(function ($compile, $rootScope){
        parentScope = $rootScope.$new();
        element = angular.element('<offers-sorter>{{2+2}}</offers-sorter>');
        $compile(element)(parentScope);
        scope = element.isolateScope();
        parentScope.$digest();
      }));

      it('should contain 4', function() {
        expect(element.html()).toBe('4');
      });

      it('should have asc/desc state on scope', function(){
        expect(scope.isAscending).toBeDefined();
      });

      it('should have default asc state of true', function(){
        expect(scope.isAscending).toBe(true);
      });

      it('should hide asc state from parent scope', inject(function ($rootScope) {
        expect(parentScope.isAscending).toBeUndefined();
      }));

    });

  });
});
