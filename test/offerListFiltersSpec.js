describe('OfferList filters', function() {
  'use strict';
  beforeEach(module('offerListFilters'));

  beforeEach(inject(function (offerFilterState) {
    // Clear filter state
    for (var prop in offerFilterState) {
      if (offerFilterState.hasOwnProperty(prop)){
        delete offerFilterState[prop];
      }
    }
  }));

  describe('doIntersect service', function() {
    it('should return false for empty arrays', inject(function (doIntersect) {
      expect(doIntersect(['a', 'b', 'c'], [])).toBe(false);
      expect(doIntersect([], ['a', 'b', 'c'])).toBe(false);
      expect(doIntersect([], [])).toBe(false);
    }));

    it('should return false for undefined', inject(function (doIntersect) {
      expect(doIntersect(undefined, ['a', 'b'])).toBe(false);
      expect(doIntersect(['a', 'b', 'c'])).toBe(false);
    }));

    it('should return false for non-intersecting arrays', inject(function (doIntersect) {
      expect(doIntersect(['a', 'b', 'c'], ['x', 'y', 'z'])).toBe(false);
    }));

    it('should detect intersection', inject(function (doIntersect) {
      expect(doIntersect(['a', 'b', 'c'], ['x', 'y', 'b'])).toBe(true);
    }));
  });

  describe('levDist service', function() {
    it('should calculate Levensthein distance', inject(function (levDist) {
      expect(levDist("abc", "abd")).toBe(1);
      expect(levDist("ca", "abc")).toBe(3);
    }));
  });

  describe('filters', function() {
    var offers;

    beforeEach(inject(function () {
      offers = [
        {'id': '1',
         'location': 'Asian Chef',
         'title': 'Sweet & Sour Chicken',
         'description': 'Kanafilee aedviljadega rikkalikus magushapus kastmes.',
         'price': 3.4,
         'tags': ['lind']},
        {'id': '2',
         'location': 'Another Place',
         'title': 'Sweet & Sour Pork',
         'description': 'Seafilee aedviljadega rikkalikus magushapus kastmes.',
         'price': 3.5,
         'tags': ['siga']},
        {'id': '3',
         'location': 'Asian Chef',
         'title': 'Sweet & Sour Beef',
         'description': 'Veisefilee aedviljadega rikkalikus magushapus kastmes.',
         'price': 3.6,
         'tags': ['loom']}
      ];

      this.addMatchers({
        toContainId: function (expected){
          var actual = this.actual;
          var notText = this.isNot ? ' not' : '';

          this.message = function(){
            return 'Expected ' + actual + notText + ' to contain id ' + expected;
          };

          return actual.some(function (elem){
            return elem.id === expected;
          });
        }
      });
    }));

    describe('TagList filter', function() {
      it('should return same array if no tags selected', inject(function (tagFilter) {
        var filteredOffers = tagFilter(offers);

        expect(filteredOffers.length).toBe(3);
        expect(filteredOffers).toContainId('1');
        expect(filteredOffers).toContainId('2');
        expect(filteredOffers).toContainId('3');
      }));


      it('should return same array if no tags selected, even if state initialized',
        inject(function (tagFilter, offerFilterState) {
          offerFilterState.selectedTags=[];
          var filteredOffers = tagFilter(offers);
          expect(filteredOffers.length).toBe(3);
          expect(filteredOffers).toContainId('1');
          expect(filteredOffers).toContainId('2');
          expect(filteredOffers).toContainId('3');
        }
      ));

      describe('with one tag selected', function() {
        beforeEach(inject(function (offerFilterState) {
          offerFilterState.selectedTags=['lind'];
        }));

        it('should return array of offers with selected tags', inject(function (tagFilter) {
          var filteredOffers = tagFilter(offers);
          expect(filteredOffers.length).toBe(1);
          expect(filteredOffers).toContainId('1');
        }));
      });

      describe('with more tags selected', function() {
        beforeEach(inject(function (offerFilterState) {
          offerFilterState.selectedTags=['lind', 'loom', 'siga', 'part'];
        }));

        it('should return array of offers with selected tags', inject(function (tagFilter) {
          var filteredOffers = tagFilter(offers);
          expect(filteredOffers.length).toBe(3);
          expect(filteredOffers).toContainId('1');
          expect(filteredOffers).toContainId('2');
          expect(filteredOffers).toContainId('3');
        }));
      });
    });

    describe('Search filter', function() {
      it('should return same array for undefined query', inject(function (searchFilter) {
        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(3);
        expect(filteredOffers).toContainId('1');
        expect(filteredOffers).toContainId('2');
        expect(filteredOffers).toContainId('3');
      }));

      it('should return same array for empty query', inject(function (searchFilter, offerFilterState) {
        offerFilterState.query = "";

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(3);
        expect(filteredOffers).toContainId('1');
        expect(filteredOffers).toContainId('2');
        expect(filteredOffers).toContainId('3');
      }));

      it('should filter on the description', inject(function (searchFilter, offerFilterState) {
        offerFilterState.query = "Kana";

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(1);
        expect(filteredOffers).toContainId('1');
      }));

      it('should be case insensitive', inject(function (searchFilter, offerFilterState) {
        offerFilterState.query = "kana";

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(1);
        expect(filteredOffers).toContainId('1');
      }));

      it('should filter on the title', inject(function (searchFilter, offerFilterState) {
        offerFilterState.query = "Chicken";

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(1);
        expect(filteredOffers).toContainId('1');
      }));

      it('should filter on tags', inject(function (searchFilter, offerFilterState) {
        offerFilterState.query = "lind";

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(1);
        expect(filteredOffers).toContainId('1');
      }));

      it('should filter on location', inject(function (searchFilter, offerFilterState) {
        offerFilterState.query = "Another";

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(1);
        expect(filteredOffers).toContainId('2');
      }));

      it('should not filter on price', inject(function (searchFilter, offerFilterState) {
        offerFilterState.query = "3.6";

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(0);
      }));

      it('should not filter on id', inject(function (searchFilter, offerFilterState) {
        offerFilterState.query = "1";

        var filteredOffers = searchFilter(offers);

        expect(filteredOffers.length).toBe(0);
      }));
    });
  });
});
