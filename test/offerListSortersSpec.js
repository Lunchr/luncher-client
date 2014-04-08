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
        element = angular.element('<offers-sorter order-by="location">{{2+2}}</offers-sorter>');
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

      it('should have orderBy value set from the attribute', function() {
        expect(scope.orderBy).toBe('location');
      });

      describe('when element clicked', function() {
        beforeEach(function (){
          scope.clicked();
        });

        it('should should reverse order for this sorter', inject(function (offerOrderState) {
          expect(scope.isAscending).toBe(false);
          scope.clicked();
          expect(scope.isAscending).toBe(true);
        }));

        it('should change the orderBy value of the state service', inject(function (offerOrderState) {
          expect(offerOrderState.orderBy).toBe('location');
        }));

        it('should set the asc/desc value of the state service', inject(function (offerOrderState) {
          expect(offerOrderState.isAscending).toBe(false);
          scope.clicked();
          expect(offerOrderState.isAscending).toBe(true);
        }));
      });

    });

  });
});
