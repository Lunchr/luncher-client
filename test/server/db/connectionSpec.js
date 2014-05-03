describe('DB connection', function() {
  'use strict';
  var srcDir = './../../../src/',
    connection = require(srcDir + 'db/connection'),
    gently = new(require('gently'))(),
    mongoose = require('mongoose'),
    Offer = mongoose.model('Offer');

  describe('offers', function() {

    describe('get', function() {
      it('get should call find and exec', function() {
        var callback = function() {};
        var findResult = {};
        gently.expect(Offer, 'find', function(options) {
          options.should.eql({});
          return findResult;
        });
        var populateRestosResult = {};
        gently.expect(findResult, 'populate', function(field, refFields) {
          field.should.eql('restaurant');
          refFields.split(' ').length.should.eql('1');
          refFields.split(' ').should.containEql('name');
          return populateRestosResult;
        });
        var populateTagsResult = {};
        gently.expect(populateRestosResult, 'populate', function(field, refFields) {
          field.should.eql('tags');
          refFields.split(' ').length.should.eql('1');
          refFields.split(' ').should.containEql('name');
          return populateTagsResult;
        });
        gently.expect(populateTagsResult, 'exec', function(execCallback) {
          execCallback.should.eql(callback);
        });

        connection.offers.get(callback);

        gently.verify();
      });
    });
  });
});
