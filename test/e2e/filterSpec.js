describe('Praad App', function() {
  'use strict';

  describe('Offer list view', function() {
    var offers, clickPromise;

    beforeEach(function() {
      browser.get('/');
      offers = element.all(by.repeater('offer in offerList'));
      clickPromise = element(by.css('.icon-5')).click().then(function(){
        return element(by.model('selectedRegion')).click().then(function() {
          return element(by.css('option[label=Tartu]')).click();
        });
      });
    });

    it('should initially have 3 offers', function() {
      clickPromise.then(function() {
        expect(offers.count()).toBe(13);
      });
    });

    it('should filter the offer list as user types into the search box', function() {
      clickPromise.then(function() {
        element(by.model('query')).sendKeys('kana');

        expect(offers.count()).toBe(1);
        var title = offers.first().element(by.binding('offer.title')).getText();
        expect(title).toBe('Pekingi kana');
      });
    });
  });
});
