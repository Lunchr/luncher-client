(function() {
  'use strict';
  var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

  var OfferSchema = new Schema({
    restaurant: {
      type: Schema.ObjectId,
      ref: 'Restaurant'
    },
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      min: 0
    },
    tags: [{
      type: Schema.ObjectId,
      ref: 'Tag'
    }]
  });

  mongoose.model('Offer', OfferSchema);
})();
