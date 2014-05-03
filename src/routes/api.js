(function(exports) {
  'use strict';
  var connection = require('./../db/connection');

  exports.offers = (function() {
    return {
      get: function(req, res) {
        connection.offers.get(function(err, offers) {
          res.json(offers);
        });
      }
    };
  })();

  exports.tags = (function() {
    return {
      get: function(req, res) {
        connection.tags.get(function(err, tags) {
          res.json(tags);
        });
      }
    };
  })();
})(exports);
