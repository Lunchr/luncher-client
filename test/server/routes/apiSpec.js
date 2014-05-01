describe('API', function() {
  'use strict';
  var api = require('../../../src/routes/api');
  var gently = new(require('gently'))();

  describe('offers', function() {
    var offers = api.offers;
    it('should export offers', function() {
      offers.should.be.ok;
    });

    describe('\'get\' router', function() {
      var get = offers.get;

      it('should be available', function() {
        get.should.be.ok;
      });

      it('should be a function', function() {
        get.should.be.a.Function;
      });

      describe('with request and response', function() {
        var req = {},
          res = {};

        it('should respond with json data', function() {
          gently.expect(res, 'json');
          get(req, res);
          gently.verify();
        });
      });
    });
  });
});
