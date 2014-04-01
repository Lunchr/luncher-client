'use strict';
describe('PhoneCat controllers', function() {
  beforeEach(module('praadApp'));

  describe('TagList filter', function() {
    var $scope;
 
    beforeEach(inject(function($rootScope, $controller) {
      $scope = $rootScope.$new();
      $controller('TagListCtrl', {$scope: $scope});

      $scope.tagList = [
        {'id': 'kala',
         'label': 'Kalast'},
        {'id': 'lind',
         'label': 'Linnust'},
        {'id': 'lammas',
         'label': 'Lambast'}
      ];
    }));

    it('should return true if no tags selected', inject(function(tagFilter) {
      expect(tagFilter(['whatever'])).toBe(true);
    }));

    it('should return true for selected tags', inject(function(tagFilter) {

    }));
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