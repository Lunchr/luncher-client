(function() {
  'use strict';
  var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

  var OfferSchema = new Schema({
    restaurant: {
      name: String
    },
    title: String,
    fromTime: Date,
    toTime: Date,
    description: String,
    price: {
      type: Number,
      min: 0
    },
    tags: [String]
  });

  mongoose.model('Offer', OfferSchema);
})();
