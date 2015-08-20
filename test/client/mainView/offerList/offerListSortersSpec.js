describe('OfferList sorters', function() {
  'use strict';
  var offerSourceService;
  beforeEach(function() {
    module('offerListSorters', 'partials', function($provide) {
      $provide.provider('offerSourceService', {
        $get: function() {
          return {
            subscribeToChanges: jasmine.createSpy('subscribeToChanges'),
          };
        }
      });
    });
    inject(function(_offerSourceService_){
      offerSourceService = _offerSourceService_;
    });
  });

  describe('with order state', function() {
    beforeEach(inject(function(offerOrderStateService) {
      offerOrderStateService.update({});
      jasmine.addMatchers(offerUtils.matchers);
    }));

    describe('offer sorter directive without numeric', function() {
      var scope;
      beforeEach(function() {
        var compiled = utils.compile('<offers-sorter order-by="location">{{2+2}}</offers-sorter>');
        scope = compiled.scope;
      });

      it('should not have isNumeric set from the attribute', function() {
        expect(scope.isNumeric).toBeFalsy();
      });
    });

    describe('offer sorter directive', function() {
      var element, scope, parentScope;
      beforeEach(function() {
        var compiled = utils.compile('<offers-sorter order-by="location" is-numeric="true">{{2+2}}</offers-sorter>');
        element = compiled.element;
        scope = compiled.scope;
        parentScope = compiled.parentScope;
        spyOn(scope, 'clicked').and.callThrough();
      });

      function clickSorter() {
        $(element.children().first()).click();
      }

      it('should transclude', function() {
        expect(element.find('span[ng-transclude=""]').children().html()).toBe('4');
      });

      it('should have default asc state of true after a click', function() {
        clickSorter();
        expect(scope.isAscending).toBe(true);
      });

      it('should hide asc state from parent scope', function() {
        expect(parentScope.isAscending).toBeUndefined();
      });

      it('should have orderBy value set from the attribute', function() {
        expect(scope.orderBy).toBe('location');
      });

      it('should have isNumeric set from the attribute', function() {
        expect(scope.isNumeric).toBeTruthy();
      });

      it('should call scope\'s clicked method on click', function() {
        clickSorter();
        expect(scope.clicked).toHaveBeenCalled();
      });

      it('should not subscribe to offer source changes', function() {
        expect(offerSourceService.subscribeToChanges).not.toHaveBeenCalled();
      });

      describe('when element clicked', function() {
        beforeEach(function() {
          clickSorter();
        });

        it('should should reverse order for this sorter', function() {
          expect(scope.isAscending).toBe(true);
          clickSorter();
          expect(scope.isAscending).toBe(false);
        });

        it('should change the orderBy value of the state service', inject(function(offerOrderStateService) {
          expect(offerOrderStateService.getCurrent().orderBy).toBe('location');
        }));

        it('should set the asc/desc value of the state service', inject(function(offerOrderStateService) {
          expect(offerOrderStateService.getCurrent().isAscending).toBe(true);
          clickSorter();
          expect(offerOrderStateService.getCurrent().isAscending).toBe(false);
        }));
      });

      describe('when state ordered by current directive', function() {
        beforeEach(inject(function(offerOrderStateService) {
          offerOrderStateService.update({
            orderBy: 'location',
          });
          scope.$apply();
        }));

        it('should be marked active', function() {
          expect(scope.isActive()).toBe(true);
        });
      });

      describe('when state ordered by some other directive', function() {
        beforeEach(inject(function(offerOrderStateService) {
          offerOrderStateService.update({
            orderBy: 'not-location',
          });
          scope.$apply();
        }));

        it('should not be marked active', function() {
          expect(scope.isActive()).toBe(false);
        });
      });
    });

    describe('offer sorter directive for \'restaurant.distance\'', function() {
      var scope;
      beforeEach(function() {
        var compiled = utils.compile('<offers-sorter is-numeric="true" order-by="restaurant.distance">Dist</offers-sorter>');
        scope = compiled.scope;
      });

      it('should subscribe to offer source changes with current scope', function() {
        expect(offerSourceService.subscribeToChanges).toHaveBeenCalled();
        expect(offerSourceService.subscribeToChanges.calls.mostRecent().args[0]).toBe(scope);
      });

      it('should update when offer source changes', function() {
        var callback = offerSourceService.subscribeToChanges.calls.mostRecent().args[1];
        callback({
          location: 'whatever',
        });

        expect(scope.isAscending).toBe(true);
        expect(scope.isActive()).toBe(true);
      });
    });

    describe('with offer sorter \'filter\'', function() {
      var offers, sort;
      beforeEach(inject(function(orderFilter) {
        offers = offerUtils.getMockOffers();
        sort = orderFilter;
      }));

      it('should return same data if offer order state empty', function() {
        var orderedOffers = sort(offers);

        expect(orderedOffers).toHaveIdOrder(['1', '2', '3', '4']);
      });

      it('should return same data if offer order state\'s orderBy field empty', inject(function(offerOrderStateService) {
        offerOrderStateService.update({
          isAscending: false,
        });

        var orderedOffers = sort(offers);

        expect(orderedOffers).toHaveIdOrder(['1', '2', '3', '4']);
      }));

      it('should order by price ascendingly', inject(function(offerOrderStateService) {
        offerOrderStateService.update({
          orderBy: 'price',
          isAscending: true,
        });

        var orderedOffers = sort(offers);

        expect(orderedOffers).toHaveIdOrder(['4', '2', '1', '3']);
      }));

      it('order ascendingly by default', inject(function(offerOrderStateService) {
        offerOrderStateService.update({
          orderBy: 'price',
        });

        var orderedOffers = sort(offers);

        expect(orderedOffers).toHaveIdOrder(['4', '2', '1', '3']);
      }));

      it('should order by price descendingly', inject(function(offerOrderStateService) {
        offerOrderStateService.update({
          orderBy: 'price',
          isAscending: false,
        });

        var orderedOffers = sort(offers);

        expect(orderedOffers).toHaveIdOrder(['3', '1', '2', '4']);
      }));
    });
  });
});
