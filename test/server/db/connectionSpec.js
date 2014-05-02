describe('DB connection', function() {
  'use strict';
  var srcDir = './../../../src/',
    connection, // = require(srcDir + 'db/connection'),
    mockery = require('mockery'),
    gently = new(require('gently'))(),
    mongoose = {},
    Offer = {};

  beforeEach(function() {
    mockery.enable();

    mongoose.model = function(model) {
      if (model === 'Offer') return Offer;
    };
    mockery.registerMock('mongoose', mongoose);
    mockery.registerAllowable(srcDir + 'db/connection');
    connection = require(srcDir + 'db/connection');
  });
  afterEach(function() {
    mockery.disable();
  });

  describe('offers', function() {

    describe('get', function() {
      it('get should call find and exec', function() {
        var callback = function() {};
        var findResult = {};
        gently.expect(Offer, 'find', function(options) {
          options.should.eql({});
          return findResult;
        });
        gently.expect(findResult, 'exec', function(execCallback) {
          execCallback.should.eql(callback);
        });

        connection.offers.get(callback);

        gently.verify();
      });
    });
  });
});
