describe('OfferList filters', function() {
  'use strict';
  beforeEach(module('offerListFilters'));

  it('should have filter state service', inject(function(offerFilterState) {
    expect(offerFilterState).toBeDefined();
  }));

  describe('doIntersect service', function() {
    it('should return false for empty arrays', inject(function(doIntersect) {
      expect(doIntersect(['a', 'b', 'c'], [])).toBe(false);
      expect(doIntersect([], ['a', 'b', 'c'])).toBe(false);
      expect(doIntersect([], [])).toBe(false);
    }));

    it('should return false for undefined', inject(function(doIntersect) {
      expect(doIntersect(undefined, ['a', 'b'])).toBe(false);
      expect(doIntersect(['a', 'b', 'c'])).toBe(false);
    }));

    it('should return false for non-intersecting arrays', inject(function(doIntersect) {
      expect(doIntersect(['a', 'b', 'c'], ['x', 'y', 'z'])).toBe(false);
    }));

    it('should detect intersection', inject(function(doIntersect) {
      expect(doIntersect(['a', 'b', 'c'], ['x', 'y', 'b'])).toBe(true);
    }));
  });

  describe('approximateDistance filter', function() {
    var filter;
    beforeEach(inject(function(approximateDistanceFilter) {
      filter = approximateDistanceFilter;
    }));

    describe('distances smaller than 1km', function() {
      it('should round meters to nearest 10m', function() {
        expect(filter(23)).toEqual('~20m');
        expect(filter(25)).toEqual('~30m');
        expect(filter(923)).toEqual('~920m');
        expect(filter(925)).toEqual('~930m');
      });
    });

    describe('distances larger than 1km', function() {
      it('should return in km with 2 decimals', function() {
        expect(filter(1023)).toEqual('~1.02km');
        expect(filter(1025)).toEqual('~1.03km');
      });
    });
  });

  describe('with filter state', function() {
    var offers;

    beforeEach(inject(function(offerFilterState) {
      offers = offerUtils.getMockOffers();
      utils.pruneObject(offerFilterState);
      jasmine.addMatchers(offerUtils.matchers);
    }));

    describe('TagList filter', function() {
      it('should return same array if no tags selected', inject(function(tagFilter) {
        var filteredOffers = tagFilter(offers);

        expect(filteredOffers.length).toBe(4);
        expect(filteredOffers).toContainId('1');
        expect(filteredOffers).toContainId('2');
        expect(filteredOffers).toContainId('3');
        expect(filteredOffers).toContainId('4');
      }));


      it('should return same array if no tags selected, even if state initialized', inject(function(tagFilter, offerFilterState) {
        offerFilterState.selectedTags = {
          main: [],
          others: [],
        };
        var filteredOffers = tagFilter(offers);
        expect(filteredOffers.length).toBe(4);
        expect(filteredOffers).toContainId('1');
        expect(filteredOffers).toContainId('2');
        expect(filteredOffers).toContainId('3');
        expect(filteredOffers).toContainId('4');
      }));

      describe('main tags', function() {
        describe('with one tag selected', function() {
          beforeEach(inject(function(offerFilterState) {
            offerFilterState.selectedTags = {
              main: ['lind'],
            };
          }));

          it('should return array of offers with selected tags', inject(function(tagFilter) {
            var filteredOffers = tagFilter(offers);
            expect(filteredOffers.length).toBe(2);
            expect(filteredOffers).toContainId('1');
            expect(filteredOffers).toContainId('4');
          }));
        });

        describe('with more tags selected', function() {
          beforeEach(inject(function(offerFilterState) {
            offerFilterState.selectedTags = {
              main: ['lind', 'loom', 'siga', 'part'],
            };
          }));

          it('should return array of offers with selected tags', inject(function(tagFilter) {
            var filteredOffers = tagFilter(offers);
            expect(filteredOffers.length).toBe(4);
            expect(filteredOffers).toContainId('1');
            expect(filteredOffers).toContainId('2');
            expect(filteredOffers).toContainId('3');
            expect(filteredOffers).toContainId('4');
          }));
        });
      });

      describe('other tags', function() {
        describe('with one tag selected', function() {
          beforeEach(inject(function(offerFilterState) {
            offerFilterState.selectedTags = {
              others: ['lind'],
            };
          }));

          it('should return array of offers with selected tags', inject(function(tagFilter) {
            var filteredOffers = tagFilter(offers);
            expect(filteredOffers.length).toBe(2);
            expect(filteredOffers).toContainId('1');
            expect(filteredOffers).toContainId('4');
          }));
        });

        describe('with more tags selected', function() {
          beforeEach(inject(function(offerFilterState) {
            offerFilterState.selectedTags = {
              others: ['lind', 'loom', 'siga', 'part'],
            };
          }));

          it('should return array of offers with selected tags', inject(function(tagFilter) {
            var filteredOffers = tagFilter(offers);
            expect(filteredOffers.length).toBe(4);
            expect(filteredOffers).toContainId('1');
            expect(filteredOffers).toContainId('2');
            expect(filteredOffers).toContainId('3');
            expect(filteredOffers).toContainId('4');
          }));
        });
      });

      describe('both tags', function() {
        it('should AND the two results together', inject(function(tagFilter, offerFilterState) {
          offerFilterState.selectedTags = {
            main: ['supp'],
            others: ['lind'],
          };

          var filteredOffers = tagFilter(offers);
          expect(filteredOffers.length).toBe(1);
          expect(filteredOffers).toContainId('4');
        }));

        it('should not return anything if no match', inject(function(tagFilter, offerFilterState) {
          offerFilterState.selectedTags = {
            main: ['supp'],
            others: ['siga'],
          };

          var filteredOffers = tagFilter(offers);
          expect(filteredOffers.length).toBe(0);
        }));
      });
    });

    describe('Search filter', function() {
      it('should return same array for undefined query', inject(function(searchFilter) {
        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(4);
        expect(filteredOffers).toContainId('1');
        expect(filteredOffers).toContainId('2');
        expect(filteredOffers).toContainId('3');
        expect(filteredOffers).toContainId('4');
      }));

      it('should return same array for empty query', inject(function(searchFilter, offerFilterState) {
        offerFilterState.query = '';

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(4);
        expect(filteredOffers).toContainId('1');
        expect(filteredOffers).toContainId('2');
        expect(filteredOffers).toContainId('3');
        expect(filteredOffers).toContainId('4');
      }));

      it('should filter on the description', inject(function(searchFilter, offerFilterState) {
        offerFilterState.query = 'Kana';

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(1);
        expect(filteredOffers).toContainId('1');
      }));

      it('should be case insensitive', inject(function(searchFilter, offerFilterState) {
        offerFilterState.query = 'kanA';

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(1);
        expect(filteredOffers).toContainId('1');
      }));

      it('should filter on the title', inject(function(searchFilter, offerFilterState) {
        offerFilterState.query = 'Chicken';

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(1);
        expect(filteredOffers).toContainId('1');
      }));

      it('should filter on tags', inject(function(searchFilter, offerFilterState) {
        offerFilterState.query = 'lind';

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(2);
        expect(filteredOffers).toContainId('1');
        expect(filteredOffers).toContainId('4');
      }));

      it('should filter on location', inject(function(searchFilter, offerFilterState) {
        offerFilterState.query = 'Bulgarian';

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(1);
        expect(filteredOffers).toContainId('2');
      }));

      it('should not filter on price', inject(function(searchFilter, offerFilterState) {
        offerFilterState.query = '3.6';

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(0);
      }));

      it('should not filter on id', inject(function(searchFilter, offerFilterState) {
        offerFilterState.query = '1';

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(0);
      }));
    });
  });
});
