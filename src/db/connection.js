module.exports = (function() {
  'use strict';
  var mongoose = require('mongoose');
  require('./models');

  return {
    offers: (function() {
      var Offer = mongoose.model('Offer');

      return {
        get: function(callback) {
          Offer
          .find({})
          .populate('restaurant', 'name')
          .populate('tags', 'name')
          .exec(callback);
        }
      };
    })()
  };
})();