describe('OfferList cotrollers', function() {
  'use strict';
  beforeEach(module('restaurantAdminViewControllers'));

  describe('RestaurantOfferListCtrl', function() {
    var $scope;

    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $httpBackend.expectGET('api/v1/restaurant').respond(offerUtils.getMockRestaurant());

      $scope = $rootScope.$new();
      $controller('RestaurantAdminViewCtrl', {
        $scope: $scope
      });
    }));

    it('should have restaurant data after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect($scope.restaurant.name).toBeUndefined();
      $httpBackend.flush();
      expect($scope.restaurant.name).toBe('Bulgarian Chef');
    }));
  });

  describe('RestaurantOfferListCtrl', function() {
    var $scope;
    var restaurantId = 'someId';

    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $httpBackend.expectGET('api/v1/restaurant/offers').respond(offerUtils.getMockOffers());

      $scope = $rootScope.$new();
      $rootScope.restaurant = {
        _id: restaurantId
      };
      $controller('RestaurantOfferListCtrl', {
        $scope: $scope
      });
    }));

    it('should have model with 3 offers after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect($scope.offers.length).toBe(0);
      $httpBackend.flush();
      expect($scope.offers.length).toBe(3);
    }));
  });

  describe('RestaurantAddOfferCtrl', function(){
    describe('previewImage directive', function() {
      var element, scope, parentScope;
      beforeEach(function() {
        var compiled = utils.compile('<a preview-image />');
        element = compiled.element;
        scope = compiled.parentScope;

        scope.setAsPreview = jasmine.createSpy();
      });

      it('should call setAsPreview method on scope with file data from change event', function(){
        var file = 'a mock file object';
        element.prop('files', [file]);

        element.triggerHandler('change');

        expect(scope.setAsPreview).toHaveBeenCalledWith(file);
      });
    });

    describe('the controller', function(){
      var $scope, mockFileReader;

      beforeEach(inject(function(_$rootScope_, $controller){
        $scope = _$rootScope_.$new();
        mockFileReader = {};
        $controller('RestaurantAddOfferCtrl', {
          $scope: $scope,
          fileReader: mockFileReader
        });
      }));

      describe('setAsPreview', function(){
        var result, file;
        beforeEach(inject(function($q){
          var deferred = $q.defer();
          result = 'result data';
          deferred.resolve(result);
          mockFileReader.readAsDataUrl = jasmine.createSpy().and.returnValue(deferred.promise);
        }));

        describe('with file', function(){
          beforeEach(function(){
            file = 'a mock file';
          });

          it('should set previewImageSrc to the result', function(){
            $scope.setAsPreview(file);

            $scope.$apply();
            expect($scope.previewImageSrc).toBe(result);
          });
        });

        describe('without file', function(){
          beforeEach(function(){
            file = undefined;
          });

          it('should set previewImageSrc to the result', function(){
            $scope.setAsPreview(file);

            $scope.$apply();
            expect($scope.previewImageSrc).toBe('');
          });
        });
      });
    });
  });
});
