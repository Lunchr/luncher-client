describe('geoSpecifier', function() {
  'use strict';
  var geoSpecifierService, $timeout, $q;
  beforeEach(function() {
    module('geoSpecifier', 'partials', function($provide){
      $provide.provider('geoSpecifierService', {
        $get: function() {
          return {
            create: jasmine.createSpy('subscribeToChanges'),
          };
        }
      });
    });
    inject(function(_geoSpecifierService_, _$timeout_, _$q_){
      geoSpecifierService = _geoSpecifierService_;
      $timeout = _$timeout_;
      $q = _$q_;
    });
  });

  describe('directive', function() {
    var element, $scope, ctrl, $parentScope;

    function compile() {
      var compiled = utils.compile('<geo-specifier address="things.address" region="things.region" register="reg($specifier)"></geo-specifier>', function(parentScope) {
        parentScope.reg = jasmine.createSpy('register');
      });
      element = compiled.element;
      $scope = compiled.scope;
      ctrl = $scope.ctrl;
      $parentScope = compiled.parentScope;
    }

    it('should load the specifier', function() {
      compile();
      expect(geoSpecifierService.create).toHaveBeenCalledWith('geo-specifier-canvas-' + $scope.$id);
    });

    describe('with the geoSpecifier promise', function() {
      var specifierDeferred;
      beforeEach(function() {
        specifierDeferred = $q.defer();
        geoSpecifierService.create.and.returnValue(specifierDeferred.promise);
        compile();
      });

      describe('resolved', function() {
        beforeEach(function() {
          specifierDeferred.resolve('specifier');
          $scope.$apply();
        });

        it('should register the specifier', function() {
          expect($parentScope.reg).toHaveBeenCalledWith('specifier');
        });
      });

      describe('resolved and address changed', function() {
        var setAddress, onResized;
        beforeEach(function() {
          setAddress = jasmine.createSpy('setAddress');
          onResized = jasmine.createSpy('onResized');
          specifierDeferred.resolve({
            setAddress: setAddress,
            onResized: onResized,
          });
          $scope.$apply();
          $parentScope.things = {
            address: 'an-address',
            region: 'a-region',
          };
          $parentScope.$apply();
        });

        it('should call the setAddress function on the specifier', function() {
          expect(setAddress).toHaveBeenCalledWith('an-address', 'a-region');
          expect(onResized).not.toHaveBeenCalled();
        });

        it('should call onResized after timeout flush', function() {
          $timeout.flush();
          expect(onResized).toHaveBeenCalled();
        });

        describe('with address changed again (from an existing address)', function() {
          beforeEach(function() {
            $timeout.flush();
            setAddress.calls.reset();
            onResized.calls.reset();

            $parentScope.things = {
              address: 'an-address2',
              region: 'a-region2',
            };
            $parentScope.$apply();
          });

          it('should call the setAddress function on the specifier', function() {
            expect(setAddress).toHaveBeenCalledWith('an-address2', 'a-region2');
            expect(onResized).not.toHaveBeenCalled();
          });

          it('should NOT call onResized after timeout flush', function() {
            $timeout.verifyNoPendingTasks();
            expect(onResized).not.toHaveBeenCalled();
          });
        });
      });

      describe('rejected', function() {
        beforeEach(function() {
          specifierDeferred.reject('whatever');
          $scope.$apply();
        });

        it('should register the specifier', function() {
          expect($parentScope.reg).not.toHaveBeenCalled();
          expect(ctrl.error).toBe(true);
        });
      });
    });
  });
});
