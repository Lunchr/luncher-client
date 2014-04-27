describe('Praad App', function() {
  'use strict';

  beforeEach(function() {
    var ptor = protractor.getInstance();
    ptor.ignoreSynchronization = true;
    ptor.sleep(2000);
  });

  describe('Offer list view', function() {

    var offers;

    beforeEach(function() {
      browser.get('/');
      offers = element.all(by.repeater('offer in offers'));
    });

    it('should initially have 3 offers', function() {
      expect(offers.count()).toBe(3);
    });

    it('should filter the offer list as user types into the search box', function() {
      element(by.model('query')).sendKeys('kana');

      expect(offers.count()).toBe(1);
      var title = offers.first().findElement(by.binding('{{offer.title}}')).getText();
      expect(title).toBe('SWEET & SOUR CHICKEN');
    });
  });
});
