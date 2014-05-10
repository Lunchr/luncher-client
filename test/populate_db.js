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
    offersJson = readApiJson('offers');

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

  mongoose.connect('mongodb://localhost/test', function() {
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
          async.parallel([

            function(cb) {
              Restaurant.findOne(offer.restaurant, function(err, restaurant) {
                offer.restaurant = restaurant._id;
                cb();
              });
            },
            function(cb) {
              async.map(offer.tags, _.bind(Tag.findOne, Tag), function(err, tags) {
                offer.tags = tags.map(function(tag) {
                  return tag._id;
                });
                cb();
              });
            }
          ], function() {
            callback(null, offer);
          });
        }, function(err, offers) {
          Offer.create(offers, loggingCallback('Creating dummy offers', cb));
        });
      },
      function(cb) {
        mongoose.disconnect(cb)
      }
    ]);
  });
})();
