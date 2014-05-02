(function() {
  'use strict';
  var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

  var RestaurantSchema = new Schema({
    name: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  });

  mongoose.model('Restaurant', RestaurantSchema);
})();
