describe('cookies service', function() {
  'use strict';
  var cookies, ipCookie;
  beforeEach(function() {
    module('cookies', function($provide) {
      $provide.provider('ipCookie', {
        $get: function() {
          return jasmine.createSpy('ipCookie');
        }
      });
    });
    inject(function(_cookies_, _ipCookie_) {
      cookies = _cookies_;
      ipCookie = _ipCookie_;
    });
  });

  describe('with module initialized', function() {
    beforeEach(function() {
      ipCookie.calls.reset();
    });

    describe('refresh expirations', function() {
      it('should not set anything if cookie currently not set', function() {
        cookies.refreshExpirations();
        expect(ipCookie).toHaveBeenCalledWith('luncher_favorites');
        expect(ipCookie.calls.count()).toEqual(1);
      });

      describe('with a cookie currently set', function() {
        var value;
        beforeEach(function() {
          value = ['an array'];
          ipCookie.and.returnValue(value);
        });

        it('should set the value again with the expiry field specified', function() {
          cookies.refreshExpirations();
          expect(ipCookie.calls.count()).toEqual(2);
          expect(ipCookie).toHaveBeenCalledWith('luncher_favorites');
          expect(ipCookie).toHaveBeenCalledWith('luncher_favorites', value, {
            expires: 28
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
