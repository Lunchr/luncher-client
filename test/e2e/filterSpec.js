describe('Praad App', function() {
  'use strict';

  describe('Offer list view', function() {
    var offers, regionSelectedPromise;

    beforeEach(function() {
      browser.manage().deleteAllCookies();
      browser.get('/');
      regionSelectedPromise = element(by.css('.icon-22')).click().then(function() {
        var EC = protractor.ExpectedConditions;
        var tartuButton = element(by.cssContainingText('.dropdown label', 'Tartu'));
        browser.wait(EC.elementToBeClickable(tartuButton), 500);
        return tartuButton.click();
      });
      offers = element.all(by.repeater('offer in restaurant.offers'));
    });

    it('should initially have 3 offers', function() {
      regionSelectedPromise.then(function() {
        expect(offers.count()).toBe(37);
      });
    });

    it('should filter the offer list as user types into the search box', function() {
      regionSelectedPromise.then(function() {
        element(by.model('search.query')).sendKeys('kana');

        expect(offers.count()).toBe(7);
        var title = offers.first().element(by.binding('offer.title')).getText();
        expect(title).toBe('Kana-riisisupp');
      });
    });
  });
});
