describe('RegisterPagesCtrl', function() {
  'use strict';
  beforeEach(module('registerPages', function($provide) {
    $provide.provider('pages', {
      $get: function() {
        return offerUtils.getMockPages();
      }
    });
  }));

  describe('submit/skip', function() {
    var vm, redirect;
    beforeEach(inject(function($location, $rootScope, $controller) {
      $location.path = jasmine.createSpy('$location.path');
      redirect = $location.path;

      var $scope = $rootScope.$new();
      $controller('RegisterPagesCtrl as vm', {
        $scope: $scope,
      });
      vm = $scope.vm;
    }));

    describe('submit', function() {
      it('should redirect to registration form, specifying the currently selected page', function() {
        vm.selectedPage = '1234';
        vm.submit();
        expect(redirect).toHaveBeenCalledWith('/register/form/1234');
      });
    });
  });
});
