describe('OfferList cotrollers', function() {
  'use strict';
  var cookies;
  beforeEach(function() {
    module('offerListControllers');
  });

  describe('Search controller', function() {
    var $scope, search;

    beforeEach(inject(function($rootScope, $controller) {
      $scope = $rootScope.$new();
      $controller('SearchCtrl as search', {
        $scope: $scope
      });
      search = $scope.search;
    }));

    it('should update filter state service', inject(function(offerFilterState) {
      search.query = "Who is ...";

      $scope.$apply();

      expect(offerFilterState.query).toBe("Who is ...");
    }));
  });

  describe('TagList controller', function() {
    var $scope, tags;

    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $httpBackend.expectGET('api/v1/tags').respond(offerUtils.getMockTags());

      $scope = $rootScope.$new();
      $controller('TagListCtrl as tags', {
        $scope: $scope
      });
      tags = $scope.tags;
    }));

    it('should have tags after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect(tags.list.length).toBe(0);
      $httpBackend.flush();
      expect(tags.list.length).toBe(3);
    }));

    describe('tag selection listener', function() {
      beforeEach(inject(function($httpBackend) {
        $httpBackend.flush();
      }));

      it('should set selected tags to empty list if nothing selected (undefined)', inject(function(offerFilterState) {
        $scope.$apply();

        expect(offerFilterState.selectedTags.length).toBe(0);
        expect(tags.selected.length).toBe(0);
      }));

      it('should set selected tags to empty list if nothing selected (false)', inject(function(offerFilterState) {
        tags.list[0].selected = false;

        $scope.$apply();

        expect(offerFilterState.selectedTags.length).toBe(0);
        expect(tags.selected.length).toBe(0);
      }));

      it('should add selected tag to list', inject(function(offerFilterState) {
        tags.list[1].selected = true;

        $scope.$apply();

        expect(offerFilterState.selectedTags.length).toBe(1);
        expect(offerFilterState.selectedTags[0]).toBe('lind');
        expect(tags.selected.length).toBe(1);
        expect(tags.selected[0]).toBe('Linnust');
      }));

      describe('with 2 tags selected', function() {

        beforeEach(function() {
          tags.list[1].selected = true;
          tags.list[2].selected = true;

          $scope.$apply();
        });

        it('should add multiple selected tags to list', inject(function(offerFilterState) {
          expect(offerFilterState.selectedTags.length).toBe(2);
          expect(offerFilterState.selectedTags).toContain('lind');
          expect(offerFilterState.selectedTags).toContain('siga');
          expect(tags.selected.length).toBe(2);
          expect(tags.selected).toContain('Linnust');
          expect(tags.selected).toContain('Seast');
        }));

        it('should remove from selected tags to list', inject(function(offerFilterState) {
          tags.list[2].selected = false;

          $scope.$apply();

          expect(offerFilterState.selectedTags.length).toBe(1);
          expect(offerFilterState.selectedTags).toContain('lind');
          expect(tags.selected.length).toBe(1);
          expect(tags.selected).toContain('Linnust');
        }));
      });
    });
  });
});
