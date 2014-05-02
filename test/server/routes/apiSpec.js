describe('API', function() {
  'use strict';
  var srcDir = './../../../src/';
  var gently = global.GENTLY = new(require('gently'))();
  var api = require(srcDir + 'routes/api');

  describe("with dummy DB connection", function() {
    var connection = gently.hijacked['./../db/connection'];

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

          it('should respond with data from the DB', function() {
            var data = {offers: ['offer1', 'offer2']};
            connection.offers = {
              get: function(callback) {
                callback(null, data);
              }
            };

            gently.expect(res, 'json', function(jsonData) {
              jsonData.should.eql(data);
            });
            get(req, res);

            gently.verify();
          });
        });
      });
    });
  });
});
