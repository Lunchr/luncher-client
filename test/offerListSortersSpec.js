describe('OfferList sorters', function() {
  'use strict';
  beforeEach(module('offerListSorters'));

  it('should have order state', inject(function (offerOrderState) {
    expect(offerOrderState).toBeDefined();
  }));

  describe('with order state', inject(function (offerOrderState) {
    beforeEach(function (){
      pruneObject(offerOrderState);
    });


  }));
});
