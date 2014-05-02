(function() {
  'use strict';
  var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

  var TagSchema = new Schema({
    name: {
      type: String,
      trim: true
    },
    displayName: {
      type: String,
      trim: true
    }
  });

  mongoose.model('Tag', TagSchema);
})();
