describe('DB connection', function() {
  'use strict';
  var srcDir = './../../../src/',
    connection = require(srcDir + 'db/connection'),
    dateUtils = require(srcDir + 'utils/dateUtils'),
    gently = new(require('gently'))(),
    mongoose = require('mongoose');

  describe('offers', function() {
    var Offer;
    before(function() {
      Offer = mongoose.model('Offer');
    });

    describe('get', function() {
      function testGet(testMethods) {
        var callback = function() {};
        var findResult = {};
        gently.expect(Offer, 'find', function(options) {
          if (testMethods.testFind) testMethods.testFind(options);
          return findResult;
        });
        var populateRestosResult = {};
        gently.expect(findResult, 'populate', function(field, refFields) {
          if (testMethods.testPopulateRestos) testMethods.testPopulateRestos(field, refFields);
          return populateRestosResult;
        });
        var populateTagsResult = {};
        gently.expect(populateRestosResult, 'populate', function(field, refFields) {
          if (testMethods.testPopulateTags) testMethods.testPopulateTags(field, refFields);
          return populateTagsResult;
        });
        gently.expect(populateTagsResult, 'exec', function(execCallback) {
          execCallback.should.eql(callback);
        });

        connection.offers.get(callback);

        gently.verify();
      }

      it('should only return todays offers', function() {
        var midnightBeforeToday = new Date(Date.now() - 10),
          midnightAfterToday = new Date();

        dateUtils.getMidnightBeforeToday = function() {
          return midnightBeforeToday;
        };
        dateUtils.getMidnightAfterToday = function() {
          return midnightAfterToday;
        };

        testGet({
          testFind: function(options) {
            var lowLimit = options.fromTime.$gte;
            var highLimit = options.fromTime.$lt;

            lowLimit.getTime().should.eql(midnightBeforeToday.getTime());
            highLimit.getTime().should.eql(midnightAfterToday.getTime());
          }
        });
      });

      it('should populate restos', function() {
        testGet({
          testPopulateRestos: function(field, refFields) {
            field.should.eql('restaurant');
            refFields.split(' ').length.should.eql('1');
            refFields.split(' ').should.containEql('name');
          }
        });
      });

      it('should populate tags', function() {
        testGet({
          testPopulateTags: function(field, refFields) {
            field.should.eql('tags');
            refFields.split(' ').length.should.eql('1');
            refFields.split(' ').should.containEql('name');
          }
        });
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
