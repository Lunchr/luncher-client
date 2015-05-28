describe('RegisterFormCtrl', function() {
  'use strict';
  beforeEach(module('registerForm', function($provide) {
    $provide.provider('page', {
      $get: function() {
        return offerUtils.getMockPages()[0];
      }
    });
  }));

  describe('with the controller initialized', function() {
    var vm, redirect, $httpBackend;
    beforeEach(inject(function($location, $rootScope, $controller, _$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $location.path = jasmine.createSpy('$location.path');
      redirect = $location.path;

      var $scope = $rootScope.$new();
      $controller('RegisterFormCtrl as vm', {
        $scope: $scope,
      });
      vm = $scope.vm;
    }));

    describe('submit', function() {
      var respond;
      beforeEach(function() {
        vm.restaurant = {
          name: 'test name',
        };
        respond = $httpBackend.expectPOST('/api/v1/restaurants', {
          name: 'test name',
        }).respond;
      });

      describe('with submit succeeding', function() {
        beforeEach(function() {
          respond(201);
        });

        it('should redirect to admin view', function() {
          vm.submit();
          expect(redirect).not.toHaveBeenCalled();
          $httpBackend.flush();
          expect(redirect).toHaveBeenCalledWith('/admin');
        });
      });

      describe('with submit failing', function() {
        beforeEach(function() {
          respond(500, 'an error message');
        });

        it('should display the error message', function() {
          vm.submit();
          $httpBackend.flush();
          expect(vm.errorMessage).toEqual('an error message');
        });
      });

      afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });
    });

    describe('isReadyForError', function() {
      it('should return true when dirty, touched and invalid', function() {
        var input = {
          $dirty: true,
          $touched: true,
          $invalid: true,
        };
        expect(vm.isReadyForError(input)).toBe(true);
      });

      it('should return false when not dirty, but touched and invalid', function() {
        var input = {
          $dirty: false,
          $touched: true,
          $invalid: true,
        };
        expect(vm.isReadyForError(input)).toBe(false);
      });

      it('should return true when when first input is false, second true', function() {
        var input1 = {
          $dirty: false,
          $touched: true,
          $invalid: true,
        };
        var input2 = {
          $dirty: true,
          $touched: true,
          $invalid: true,
        };
        expect(vm.isReadyForError(input1, input2)).toBe(true);
      });
    });
  });
});
