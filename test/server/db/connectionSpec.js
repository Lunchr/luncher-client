describe('DB connection', function() {
  'use strict';
  var srcDir = './../../../src/',
    connection = require(srcDir + 'db/connection'),
    gently = new(require('gently'))(),
    mongoose = require('mongoose');

  describe('offers', function() {
    var Offer;
    before(function() {
      Offer = mongoose.model('Offer');
    });

    describe('get', function() {
      it('should call find and exec', function() {
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

  describe('tags', function() {
    var Tag;
    before(function() {
      Tag = mongoose.model('Tag');
    });

    describe('get', function() {
      it('should call find and exec', function() {
        var callback = function() {};
        var findResult = {};
        gently.expect(Tag, 'find', function(options) {
          options.should.eql({});
          return findResult;
        });
        gently.expect(findResult, 'exec', function(execCallback) {
          execCallback.should.eql(callback);
        });

        connection.tags.get(callback);

        gently.verify();
      });
    });
  });
});
