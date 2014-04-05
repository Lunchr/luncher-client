'use strict';
describe('PraadApp', function() {
  beforeEach(module('praadApp'));

  beforeEach(inject(function (offerFilterState) {
    // Clear filter state
    for (var prop in offerFilterState) { if (offerFilterState.hasOwnProperty(prop)) { delete offerFilterState[prop]; } }
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

  describe('TagList controller', function() {
    var $scope;
 
    beforeEach(inject(function ($rootScope, $controller) {
      $scope = $rootScope.$new();
      $controller('TagListCtrl', {$scope: $scope});

      $scope.tagList = [
        {'id': 'kala',
         'label': 'Kalast'},
        {'id': 'lind',
         'label': 'Linnust'},
        {'id': 'siga',
         'label': 'Seast'}
      ];
    }));

    describe('tag selection listener', function() {
      it('should set selected tags to empty list if nothing selected (undefined)', inject(function (offerFilterState) {
        $scope.tagSelectionChanged();

        expect(offerFilterState.selectedTags.length).toBe(0);
      }));

      it('should set selected tags to empty list if nothing selected (false)', inject(function (offerFilterState) {
        $scope.tagList[0].selected = false;

        $scope.tagSelectionChanged();

        expect(offerFilterState.selectedTags.length).toBe(0);
      }));

      it('should add selected tag to list', inject(function (offerFilterState) {
        $scope.tagList[1].selected = true;

        $scope.tagSelectionChanged();

        expect(offerFilterState.selectedTags.length).toBe(1);
        expect(offerFilterState.selectedTags[0]).toBe('lind');
      }));

      describe('with 2 tags selected', function() {

        beforeEach(function (){
          $scope.tagList[1].selected = true;
          $scope.tagList[2].selected = true;

          $scope.tagSelectionChanged();
        });

        it('should add multiple selected tags to list', inject(function (offerFilterState) {
          expect(offerFilterState.selectedTags.length).toBe(2);
          expect(offerFilterState.selectedTags).toContain('lind');
          expect(offerFilterState.selectedTags).toContain('siga');
        }));

        it('should remove from selected tags to list', inject(function (offerFilterState) {
          $scope.tagList[2].selected = false;

          $scope.tagSelectionChanged();

          expect(offerFilterState.selectedTags.length).toBe(1);
          expect(offerFilterState.selectedTags).toContain('lind');
        }));
      });
    });
  });

  describe('TagList filter', function() {
    var offers;
 
    beforeEach(inject(function ($rootScope, $controller) {
      offers = [
        {'id': '1',
         'location': 'Asian Chef',
         'title': 'Sweet & Sour Chicken',
         'description': 'Kanafilee aedviljadega rikkalikus magushapus kastmes.',
         'price': 3.4,
         'tags': ['lind']},
        {'id': '2',
         'location': 'Asian Chef',
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
            return "Expected " + actual + notText + " to contain id " + expected;
          }

          return actual.some(function (elem){
            return elem.id === expected
          });
        }
      });
    }));

    it('should return same array if no tags selected', inject(function (tagFilter) {
      var filteredOffers = tagFilter(offers);
      expect(filteredOffers.length).toBe(3);
      expect(filteredOffers).toContainId('1');
      expect(filteredOffers).toContainId('2');
      expect(filteredOffers).toContainId('3');
    }));


    it('should return same array if no tags selected, even if state initialized', inject(function (tagFilter, offerFilterState) {
      offerFilterState.selectedTags=[];
      var filteredOffers = tagFilter(offers);
      expect(filteredOffers.length).toBe(3);
      expect(filteredOffers).toContainId('1');
      expect(filteredOffers).toContainId('2');
      expect(filteredOffers).toContainId('3');
    }));

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

  describe('OfferListCtrl', function(){
    var $scope;
 
    beforeEach(inject(function($rootScope, $controller) {
      $scope = $rootScope.$new();
      $controller('OfferListCtrl', {$scope: $scope});
    }));

    it('should create "offers" model with 3 offers', function() {
      expect($scope.offers.length).toBe(3);
    });
  });
});