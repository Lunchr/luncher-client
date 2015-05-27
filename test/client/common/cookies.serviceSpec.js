describe('cookies service', function() {
  'use strict';
  var cookies, $cookies;
  beforeEach(function() {
    module('cookies', function($provide) {
      $provide.provider('$cookies', {
        $get: function() {
          return {
            getObject: jasmine.createSpy('getCookie'),
            putObject: jasmine.createSpy('putCookie'),
            remove: jasmine.createSpy('removeCookie'),
          };
        }
      });
    });
    inject(function(_cookies_, _$cookies_) {
      cookies = _cookies_;
      $cookies = _$cookies_;
    });
  });

  describe('with module initialized', function() {
    beforeEach(function() {
      $cookies.getObject.calls.reset();
      $cookies.putObject.calls.reset();
    });

    describe('refresh expirations', function() {
      it('should not set anything if cookie currently not set', function() {
        cookies.refreshExpirations();

        expect($cookies.putObject).not.toHaveBeenCalled();
        expect($cookies.getObject.calls.count()).toEqual(3);
        expect($cookies.getObject).toHaveBeenCalledWith('luncher_favorites');
        expect($cookies.getObject).toHaveBeenCalledWith('luncher_offer_source');
        expect($cookies.getObject).toHaveBeenCalledWith('luncher_filters');
      });

      describe('with a cookie currently set', function() {
        var value;
        beforeEach(function() {
          value = ['an array'];
          $cookies.getObject.and.returnValue(value);
          jasmine.clock().install();
          jasmine.clock().mockDate(new Date(2015, 5, 27));
        });

        afterEach(function() {
          jasmine.clock().uninstall();
        });

        it('should set the value again with the expiry field specified', function() {
          cookies.refreshExpirations();

          expect($cookies.getObject.calls.count()).toEqual(3);
          expect($cookies.putObject.calls.count()).toEqual(3);
          expect($cookies.getObject).toHaveBeenCalledWith('luncher_favorites');
          expect($cookies.putObject).toHaveBeenCalledWith('luncher_favorites', value, {
            expires: new Date(2015, 6, 25),
          });
          expect($cookies.getObject).toHaveBeenCalledWith('luncher_offer_source');
          expect($cookies.putObject).toHaveBeenCalledWith('luncher_offer_source', value, {
            expires: new Date(2015, 6, 25),
          });
          expect($cookies.getObject).toHaveBeenCalledWith('luncher_filters');
          expect($cookies.putObject).toHaveBeenCalledWith('luncher_filters', value, {
            expires: new Date(2015, 6, 25),
          });
        });
      });
    });
  });
});

describe('cookies module run block', function() {
  'use strict';
  beforeEach(module('cookies', function($provide) {
    $provide.provider('cookies', {
      $get: function() {
        return {
          refreshExpirations: jasmine.createSpy('refreshExpirations'),
        };
      }
    });
  }));

  it('should have called the refresh function on initialization', inject(function(cookies) {
    expect(cookies.refreshExpirations).toHaveBeenCalled();
  }));
});
