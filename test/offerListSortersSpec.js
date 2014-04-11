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
        spyOn(scope, 'clicked').andCallThrough();
        parentScope.$digest();
      }));

      it('should contain 4 in a span', function() {
        expect(element.children().html()).toBe('4');
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

      it('should have class order-asc by default', function() {
        expect(element).toHaveClass('order-asc');
      });

      it('should call scope\'s clicked method on click', function() {
        $(element).click();
        expect(scope.clicked).toHaveBeenCalled();
      });

      describe('when element clicked', function() {
        beforeEach(function (){
          $(element).click();
        });

        it('should should reverse order for this sorter', inject(function (offerOrderState) {
          expect(scope.isAscending).toBe(false);
          $(element).click();
          expect(scope.isAscending).toBe(true);
        }));

        it('should change the orderBy value of the state service', inject(function (offerOrderState) {
          expect(offerOrderState.orderBy).toBe('location');
        }));

        it('should set the asc/desc value of the state service', inject(function (offerOrderState) {
          expect(offerOrderState.isAscending).toBe(false);
          $(element).click();
          expect(offerOrderState.isAscending).toBe(true);
        }));

        it('should have class order-{asc/desc} swapped', function() {
          expect(element).toHaveClass('order-desc');
          $(element).click();
          expect(element).toHaveClass('order-asc');
        });
      });

      describe('when state ordered by current directive', function() {
        beforeEach(inject(function (offerOrderState){
          offerOrderState.orderBy = "location";
          scope.$apply();
        }));

        it('should be marked active', function() {
          expect(scope.isActive()).toBe(true);
        });

        it('should have the order-active class', function() {
          expect(element).toHaveClass('order-active');
        });

        it('should have the default class order-asc', function() {
          expect(element).toHaveClass('order-asc');
        });
      });

      describe('when state ordered by some other directive', function() {
        beforeEach(inject(function (offerOrderState){
          offerOrderState.orderBy = "not-location";
          scope.$apply();
        }));

        it('should not be marked active', function() {
          expect(scope.isActive()).toBe(false);
        });

        it('should not have the order-active class', function() {
          expect(element).not.toHaveClass('order-active');
        });

        it('should turn active after a click', function() {
          $(element).click();
          expect(element).toHaveClass('order-active');
        });

        it('should have the default class order-asc', function() {
          expect(element).toHaveClass('order-asc');
        });
      });
    });
  });
});
