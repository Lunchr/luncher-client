module.exports = (function() {
  'use strict';
  var mongoose = require('mongoose'),
  dateUtils = require('./../utils/dateUtils');
  require('./models');

  return {
    offers: (function() {
      var Offer = mongoose.model('Offer');

      return {
        get: function(callback) {
          Offer
          .find({
            fromTime: {
              $gte: dateUtils.getMidnightBeforeToday(),
              $lt: dateUtils.getMidnightAfterToday()
            }
          })
          .populate('restaurant', 'name')
          .populate('tags', 'name')
          .exec(callback);
        }
      };
    })(),
    tags: (function() {
      var Tag = mongoose.model('Tag');

      return {
        get: function(callback) {
          Tag
          .find({})
          .exec(callback);
        }
      };
    })()
  };
})();
