describe('Praad App', function() {
  'use strict';

  describe('Offer list view', function() {
    var offers;

    beforeEach(function() {
      browser.get('/');
      offers = element.all(by.repeater('offer in offers'));
    });

    it('should initially have 3 offers', function() {
      offers.count(); // I don't know why but this fixes an issue with the count being 0
      expect(offers.count()).toBe(13);
    });

    it('should filter the offer list as user types into the search box', function() {
      element(by.model('query')).sendKeys('kana');

      expect(offers.count()).toBe(1);
      var title = offers.first().element(by.binding('offer.title')).getText();
      expect(title).toBe('Pekingi kana');
    });
  });
});
