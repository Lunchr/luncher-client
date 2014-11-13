(function() {
  'use strict';
  require('./../src/db/models');
  var mongoose = require('mongoose'),
    fs = require('fs'),
    async = require('async'),
    _ = require('underscore'),
    Offer = mongoose.model('Offer'),
    Tag = mongoose.model('Tag'),
    Restaurant = mongoose.model('Restaurant'),
    restaurantsJson = readApiJson('restaurants'),
    tagsJson = readApiJson('tags'),
    offersJson = readApiJson('offers'),
    config = require('./../src/config');

  function readApiJson(fileName) {
    return JSON.parse(fs.readFileSync(__dirname + '/../public/api/' + fileName));
  }

  function loggingCallback(action, cb) {
    return function(error) {
      if (error) {
        console.error(error);
        if (cb) {
          cb.apply(this, arguments);
        }
      } else {
        console.log(action);
        if (cb) {
          cb.apply(this, arguments);
        }
      }
    };
  }

  mongoose.connect(config.dbAdress, function() {
    async.series([

      function(cb) {
        Restaurant.remove(loggingCallback('Clearing restaurant collection', cb));
      },
      function(cb) {
        Restaurant.create(restaurantsJson, loggingCallback('Creating dummy restaurants', cb));
      },
      function(cb) {
        Tag.remove(loggingCallback('Clearing tag collection', cb));
      },
      function(cb) {
        Tag.create(tagsJson, loggingCallback('Creating dummy tags', cb));
      },
      function(cb) {
        Offer.remove(loggingCallback('Clearing offer collection', cb));
      },
      function(cb) {
        async.map(offersJson, function(offer, callback) {
          offer.fromTime = new Date(offer.fromTime);
          offer.toTime = new Date(offer.toTime);
          delete offer.id;
          callback(null, offer);
        }, function(err, offers) {
          function clone(obj) {
            var clone = {};
            for (var property in obj) clone[property] = obj[property];
            return clone;
          }
          var newOffers = [];
          offers.forEach(function(offer) {
            for (var i = 1; i <= 100; i++) {
              var newOffer = clone(offer);
              newOffer.fromTime = new Date(offer.fromTime.getTime() + i * 24 * 60 * 60 * 1000);
              newOffer.toTime = new Date(offer.toTime.getTime() + i * 24 * 60 * 60 * 1000);
              newOffers.push(newOffer);
            };
          });
          Offer.create(offers.concat(newOffers), loggingCallback('Creating dummy offers', cb));
        });
      },
      function(cb) {
        mongoose.disconnect(cb)
      }
    ]);
  });
})();
