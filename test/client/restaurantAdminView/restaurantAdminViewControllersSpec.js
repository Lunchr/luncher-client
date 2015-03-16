describe('OfferList cotrollers', function() {
  'use strict';
  beforeEach(module('restaurantAdminViewControllers'));

  describe('RestaurantOfferListCtrl', function() {
    var $scope;

    afterEach(inject(function($httpBackend) {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }));

    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $httpBackend.expectGET('api/v1/restaurants/me').respond(offerUtils.getMockRestaurant());

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
      $httpBackend.expectGET('api/v1/restaurants/me/offers').respond(offerUtils.getMockOffers());

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

    describe('with the original offers fetched from the backend', function() {
      beforeEach(inject(function($httpBackend) {
        $httpBackend.flush();
      }));

      describe('$on(\'offer-posted\') listener', function() {
        var mockOffer, deferred;

        beforeEach(inject(function($q) {
          deferred = $q.defer();
          mockOffer = {
            $promise: deferred.promise,
          };
        }));

        it('should prepend a broadcasted offer into the list of offers', function() {
          var nrOfOffers = $scope.offers.length;

          $scope.$broadcast('offer-posted', mockOffer);

          expect($scope.offers.length).toEqual(nrOfOffers + 1);
          expect($scope.offers[0]).toBe(mockOffer);
        });

        describe('with the offer prepended to the list of offers', function() {
          beforeEach(function() {
            $scope.$broadcast('offer-posted', mockOffer);
          });

          it('should mark the offer as confirmed when promise is resolved', function() {
            expect(mockOffer.confirmationPending).toBeTruthy();

            $scope.$apply(function() {
              deferred.resolve();
            });

            expect(mockOffer.confirmationPending).toBeFalsy();
          });

          it('should remove the offer from the list if promise is rejected', function() {
            var nrOfOffers = $scope.offers.length;
            expect($scope.offers[0]).toBe(mockOffer);

            $scope.$apply(function() {
              deferred.reject();
            });

            expect($scope.offers.length).toEqual(nrOfOffers - 1);
            expect($scope.offers[0]).not.toBe(mockOffer);
          });
        });
      });
    });
  });

  describe('RestaurantAddOfferCtrl', function() {
    describe('previewImage directive', function() {
      var element, scope, parentScope;
      beforeEach(function() {
        var compiled = utils.compile('<a preview-image />');
        element = compiled.element;
        scope = compiled.parentScope;

        scope.setAsPreview = jasmine.createSpy();
      });

      it('should call setAsPreview method on scope with file data from change event', function() {
        var file = 'a mock file object';
        element.prop('files', [file]);

        element.triggerHandler('change');

        expect(scope.setAsPreview).toHaveBeenCalledWith(file);
      });
    });

    describe('the controller', function() {
      var $scope, $parentScope, mockFileReader;

      beforeEach(inject(function($rootScope, $controller) {
        $parentScope = $rootScope;
        $scope = $parentScope.$new();
        mockFileReader = {};
        $controller('RestaurantAddOfferCtrl', {
          $scope: $scope,
          fileReader: mockFileReader
        });
      }));

      it('should have a date string representing today', function() {
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        var todayInUTC = Date.parse($scope.today);
        expect(todayInUTC).toEqual(today.getTime() - today.getTimezoneOffset() * 60 * 1000);
      });

      describe('setAsPreview', function() {
        var result, file;
        beforeEach(inject(function($q) {
          var deferred = $q.defer();
          result = 'result data';
          deferred.resolve(result);
          mockFileReader.readAsDataUrl = jasmine.createSpy().and.returnValue(deferred.promise);
        }));

        describe('with file', function() {
          beforeEach(function() {
            file = 'a mock file';
          });

          it('should set previewImageSrc to the result', function() {
            $scope.setAsPreview(file);

            $scope.$apply();
            expect($scope.previewImageSrc).toBe(result);
          });
        });

        describe('without file', function() {
          beforeEach(function() {
            file = undefined;
          });

          it('should set previewImageSrc to the result', function() {
            $scope.setAsPreview(file);

            $scope.$apply();
            expect($scope.previewImageSrc).toBe('');
          });
        });
      });

      describe('postOffer', function() {
        var postedOffer;

        beforeEach(inject(function($httpBackend) {
          spyOn($parentScope, '$broadcast');
          postedOffer = {
            id: 'mocked response from the backend'
          };
          $httpBackend.whenPOST('api/v1/offers').respond(postedOffer);
        }));

        describe('with the form filled', function() {
          beforeEach(function() {
            $scope.title = 'a title';
            $scope.tags = ['tag1', 'tag2'];
            $scope.price = 2.5;
            $scope.date = new Date(2015, 3, 15);
            $scope.fromTime = new Date(1970, 0, 1, 10, 0, 0);
            $scope.toTime = new Date(1970, 0, 1, 15, 0, 0);
            $scope.image = 'image data';
          });

          it('should broadcast the data returned from the POST', inject(function($httpBackend) {
            $scope.postOffer();

            expect($parentScope.$broadcast).toHaveBeenCalled();
            var args = $parentScope.$broadcast.calls.mostRecent().args;
            var channelName = args[0];
            var data = args[1];
            expect(channelName).toEqual('offer-posted');

            expect(data.id).toBeUndefined();
            $httpBackend.flush();
            expect(data.id).toEqual(postedOffer.id);
          }));

          it('should post the combined offer', inject(function($httpBackend) {
            $httpBackend.expectPOST('api/v1/offers', {
              title: 'a title',
              tags: ['tag1', 'tag2'],
              price: 2.5,
              from_time: new Date(2015, 3, 15, 10, 0, 0),
              to_time: new Date(2015, 3, 15, 15, 0, 0),
              image: 'image data',
            });

            $scope.postOffer();
            $httpBackend.flush();
          }));
        });
      });
    });
  });
});
