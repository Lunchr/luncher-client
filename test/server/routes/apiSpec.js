describe('API', function() {
  'use strict';
  var srcDir = './../../../src/',
    gently = new(require('gently'))(),
    mockery = require('mockery'),
    connection = {},
    api;

  before(function() {
    mockery.enable();

    mockery.registerMock('./../db/connection', connection);
    mockery.registerAllowable(srcDir + 'routes/api');
    api = require(srcDir + 'routes/api');
  });
  after(function() {
    mockery.disable();
  });

  describe('offers', function() {
    var offers;
    before(function() {
      offers = api.offers;
    });

    it('should export offers', function() {
      offers.should.be.ok;
    });

    describe('\'get\' router', function() {
      var get;
      before(function() {
        get = offers.get;
      });

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
          var data = {
            offers: ['offer1', 'offer2']
          };
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
