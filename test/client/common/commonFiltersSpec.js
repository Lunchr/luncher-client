describe('Common filters', function() {
  'use strict';
  beforeEach(module('commonFilters'));

  describe('joinTags filter', function() {
    var filter;

    beforeEach(inject(function(joinTagsFilter) {
      filter = joinTagsFilter;
    }));

    it('should join an array of strings', function() {
      var result = filter(['First', 'second', 'third']);

      expect(result).toEqual('First, second, third');
    });

    it('should join an array of nested (by ng-tags-input) strings', function() {
      var result = filter([{text: 'First'}, {text: 'second'}, {text: 'third'}]);

      expect(result).toEqual('First, second, third');
    });

    it('should capitalize the first letter, lowercase the rest', function() {
      var result = filter(['fIrSt', 'SeCoNd', 'THIRD']);

      expect(result).toEqual('First, second, third');
    });
  });
});
