describe('offerSource', function() {
  'use strict';
  var cookies;
  beforeEach(function() {
    module('offerSource', 'pubSub', function($provide) {
      $provide.provider('cookies', {
        $get: function() {
          return {
            refreshExpirations: function() {},
            setOfferSource: jasmine.createSpy('setOfferSource'),
            getOfferSource: jasmine.createSpy('getOfferSource'),
            removeOfferSource: jasmine.createSpy('removeOfferSource'),
          };
        }
      });
    });
    inject(function(_cookies_) {
      cookies = _cookies_;
    });
  });

  describe('offerSourceService', function() {
    var service;
    describe('getCurrent', function() {
      describe('with no cookie set', function() {
        beforeEach(inject(function(offerSourceService) {
          service = offerSourceService;
        }));

        it('should return undefined', function() {
          expect(service.getCurrent()).toBeUndefined();
        });

        describe('with the source updated', function() {
          beforeEach(function() {
            service.update('test');
          });

          it('should return the updated value', function() {
            expect(service.getCurrent()).toEqual('test');
          });
        });
      });

      describe('with cookie set', function() {
        beforeEach(function() {
          cookies.getOfferSource.and.returnValue('test');
          inject(function(offerSourceService) {
            service = offerSourceService;
          });
        });

        it('should return the cookie value', function() {
          expect(service.getCurrent()).toEqual('test');
        });
      });
    });

    describe('with the service initialized', function() {
      beforeEach(inject(function(offerSourceService) {
        service = offerSourceService;
      }));

      it('should update the cookie on update', function() {
        expect(cookies.setOfferSource).not.toHaveBeenCalled();
        service.update('test');
        expect(cookies.setOfferSource).toHaveBeenCalledWith('test');
      });

      describe('with a callback registered for updates', function() {
        var $scope, callback;
        beforeEach(inject(function($rootScope) {
          $scope = $rootScope.$new();
          callback = jasmine.createSpy('callback');
          service.subscribeToChanges($scope, callback);
        }));

        it('should be called when an update is triggered', function() {
          expect(callback).not.toHaveBeenCalled();
          service.update('test');
          expect(callback).toHaveBeenCalledWith('test');
        });

        it('should unregister the callback if the scope is destroyed', function() {
          $scope.$destroy();
          service.update('test');
          expect(callback).not.toHaveBeenCalled();
        });
      });
    });
  });
});
