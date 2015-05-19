describe('Favorites module', function() {
  'use strict';
  var favorites, cookies;
  beforeEach(function() {
    module('favorites', function($provide) {
      $provide.provider('cookies', {
        $get: function() {
          return {
            refreshExpirations: function(){},
            setFavorites: jasmine.createSpy('setFavorites'),
            getFavorites: jasmine.createSpy('getFavorites'),
            removeFavorites: jasmine.createSpy('removeFavorites'),
          };
        }
      });
    });
    inject(function(_favorites_, _cookies_){
      favorites = _favorites_;
      cookies = _cookies_;
    });
  });

  describe('toggle inclusion', function() {
    describe('with no cookie currently set', function() {
      it('should create an array with the given restaurant name as the cookie', function() {
        favorites.toggleInclusion('a restaurant');

        expect(cookies.getFavorites).toHaveBeenCalled();
        expect(cookies.setFavorites).toHaveBeenCalledWith(['a restaurant']);
      });
    });

    describe('with a restaurant set as favorite', function() {
      beforeEach(function() {
        cookies.getFavorites.and.returnValue(['a restaurant']);
      });

      it('should add another restaurant', function() {
        favorites.toggleInclusion('another restaurant');

        expect(cookies.getFavorites).toHaveBeenCalled();
        expect(cookies.setFavorites).toHaveBeenCalledWith(['a restaurant', 'another restaurant']);
      });

      describe('with the same restaurant toggled', function() {
        it('should remove the cookie', function() {
          favorites.toggleInclusion('a restaurant');

          expect(cookies.getFavorites).toHaveBeenCalled();
          expect(cookies.removeFavorites).toHaveBeenCalled();
        });
      });
    });

    describe('with 2 restaurants set as favorite', function() {
      beforeEach(function() {
        cookies.getFavorites.and.returnValue(['a restaurant', 'another restaurant']);
      });

      it('should remove an existing restaurant from the array', function() {
        favorites.toggleInclusion('another restaurant');

        expect(cookies.getFavorites).toHaveBeenCalled();
        expect(cookies.setFavorites).toHaveBeenCalledWith(['a restaurant']);
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
      expect(offers[0].restaurant.isFavorite).toBe(false);
      expect(offers[1].restaurant.isFavorite).toBe(false);
    });

    describe('with none of the offers having a favorite restaurant', function() {
      beforeEach(function() {
        cookies.getFavorites.and.returnValue(['something entirely different']);
      });

      it('should set isFavorite false for all offers', function() {
        favorites.decorateOffers(offers);
        expect(offers[0].restaurant.isFavorite).toBe(false);
        expect(offers[1].restaurant.isFavorite).toBe(false);
      });
    });

    describe('with one of the offers having a favorite restaurant', function() {
      beforeEach(function() {
        cookies.getFavorites.and.returnValue(['a restaurant']);
      });

      it('should set isFavorite to true for the offer', function() {
        favorites.decorateOffers(offers);
        expect(offers[0].restaurant.isFavorite).toBe(true);
        expect(offers[1].restaurant.isFavorite).toBe(false);
      });
    });

    describe('with both offers having a favorite restaurant', function() {
      beforeEach(function() {
        cookies.getFavorites.and.returnValue(['a restaurant', 'another restaurant']);
      });

      it('should set isFavorite to true for the offer', function() {
        favorites.decorateOffers(offers);
        expect(offers[0].restaurant.isFavorite).toBe(true);
        expect(offers[1].restaurant.isFavorite).toBe(true);
      });
    });

    describe('with one offer being marked as favorite but without a cookie', function() {
      beforeEach(function() {
        offers[0].restaurant.isFavorite = true;
      });

      it('should set isFavorite false for all offers', function() {
        favorites.decorateOffers(offers);
        expect(offers[0].restaurant.isFavorite).toBe(false);
        expect(offers[1].restaurant.isFavorite).toBe(false);
      });
    });
  });
});
