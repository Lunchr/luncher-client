describe('Favorites module', function() {
  'use strict';
  var favorites, ipCookie;
  beforeEach(function() {
    module('favorites', function($provide) {
      // mock the ipCookie service
      $provide.provider('ipCookie', {
        $get: function() {
          return jasmine.createSpy('ipCookie');
        }
      });
    });
    inject(function(_favorites_, _ipCookie_){
      favorites = _favorites_;
      ipCookie = _ipCookie_;
    });
  });

  describe('with module initialized', function() {
    beforeEach(function() {
      ipCookie.calls.reset();
    });

    describe('refresh cookie expirations', function() {
      it('should not set anything if cookie currently not set', function() {
        favorites.refreshCookieExpirations();
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
          favorites.refreshCookieExpirations();
          expect(ipCookie.calls.count()).toEqual(2);
          expect(ipCookie).toHaveBeenCalledWith('luncher_favorites');
          expect(ipCookie).toHaveBeenCalledWith('luncher_favorites', value, {expires: 28});
        });
      });
    });

    describe('toggle inclusion', function() {
      describe('with no cookie currently set', function() {
        it('should create an array with the given restaurant name as the cookie', function() {
          favorites.toggleInclusion('a restaurant');

          expect(ipCookie.calls.count()).toEqual(2);
          expect(ipCookie).toHaveBeenCalledWith('luncher_favorites');
          expect(ipCookie).toHaveBeenCalledWith('luncher_favorites', ['a restaurant'], {expires: 28});
        });
      });

      describe('with a restaurant set as favorite', function() {
        beforeEach(function() {
          ipCookie.and.returnValue(['a restaurant']);
        });

        it('should add another restaurant', function() {
          favorites.toggleInclusion('another restaurant');

          expect(ipCookie.calls.count()).toEqual(2);
          expect(ipCookie).toHaveBeenCalledWith('luncher_favorites');
          expect(ipCookie).toHaveBeenCalledWith('luncher_favorites', ['a restaurant', 'another restaurant'], {expires: 28});
        });

        describe('with the same restaurant toggled', function() {
          beforeEach(function() {
            ipCookie.remove = jasmine.createSpy('remove');
          });

          it('should remove the cookie', function() {
            favorites.toggleInclusion('a restaurant');

            expect(ipCookie.calls.count()).toEqual(1);
            expect(ipCookie).toHaveBeenCalledWith('luncher_favorites');
            expect(ipCookie.remove).toHaveBeenCalledWith('luncher_favorites');
          });
        });
      });

      describe('with 2 restaurants set as favorite', function() {
        beforeEach(function() {
          ipCookie.and.returnValue(['a restaurant', 'another restaurant']);
        });

        it('should remove an existing restaurant from the array', function() {
          favorites.toggleInclusion('another restaurant');

          expect(ipCookie.calls.count()).toEqual(2);
          expect(ipCookie).toHaveBeenCalledWith('luncher_favorites');
          expect(ipCookie).toHaveBeenCalledWith('luncher_favorites', ['a restaurant'], {expires: 28});
        });
      });
    });

    describe('decorate offers', function() {
      var offers;
      beforeEach(function() {
        offers = [{
          restaurant: {name: 'a restaurant'},
        }, {
          restaurant: {name: 'another restaurant'},
        }];
      });

      it('should set isFavorite to false for all offers if no cookie set', function() {
        favorites.decorateOffers(offers);
        expect(offers[0].isFavorite).toBe(false);
        expect(offers[1].isFavorite).toBe(false);
      });

      describe('with none of the offers having a favorite restaurant', function() {
        beforeEach(function() {
          ipCookie.and.returnValue(['something entirely different']);
        });

        it('should set isFavorite false for all offers', function() {
          favorites.decorateOffers(offers);
          expect(offers[0].isFavorite).toBe(false);
          expect(offers[1].isFavorite).toBe(false);
        });
      });

      describe('with one of the offers having a favorite restaurant', function() {
        beforeEach(function() {
          ipCookie.and.returnValue(['a restaurant']);
        });

        it('should set isFavorite to true for the offer', function() {
          favorites.decorateOffers(offers);
          expect(offers[0].isFavorite).toBe(true);
          expect(offers[1].isFavorite).toBe(false);
        });
      });

      describe('with both offers having a favorite restaurant', function() {
        beforeEach(function() {
          ipCookie.and.returnValue(['a restaurant', 'another restaurant']);
        });

        it('should set isFavorite to true for the offer', function() {
          favorites.decorateOffers(offers);
          expect(offers[0].isFavorite).toBe(true);
          expect(offers[1].isFavorite).toBe(true);
        });
      });

      describe('with one offer being marked as favorite but without a cookie', function() {
        beforeEach(function() {
          offers[0].isFavorite = true;
        });

        it('should set isFavorite false for all offers', function() {
          favorites.decorateOffers(offers);
          expect(offers[0].isFavorite).toBe(false);
          expect(offers[1].isFavorite).toBe(false);
        });
      });
    });
  });
});

describe('Favorites module run block', function() {
  'use strict';
  beforeEach(module('favorites', function($provide) {
    // mock the favorites service
    $provide.provider('favorites', {
      $get: function() {
        return {
          refreshCookieExpirations: jasmine.createSpy('refreshCookieExpirations'),
        };
      }
    });
  }));

  it('should have called the refresh function on initialization', inject(function(favorites) {
    expect(favorites.refreshCookieExpirations).toHaveBeenCalled();
  }));
});
