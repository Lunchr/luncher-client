(function() {
  'use strict';
  /**
   * Module dependencies
   */

  var express = require('express'),
    serveStatic = require('serve-static'),
    http = require('http'),
    path = require('path'),
    config = require('./config'),
    bodyParser = require('body-parser');

  var app = module.exports = express();

  app.set('port', config.port);

  // app.use('/api/v1/restaurant', function(req, res) {
  //   res.status(403).send('nope');
  // });
  app.use(bodyParser.json());
  var delayedReflector = function(req, res) {
    setTimeout(function() {
      var response = req.body;
      if (!response._id) {
        response._id = getRandomInt(100, 1000);
      }
      res.send(response);
      // res.status(500).send('uh oh');
    }, 1000);
  };
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  app.post('/api/v1/restaurants/:restaurantID/offers', delayedReflector);
  app.put('/api/v1/restaurants/:restaurantID/offers/:id', delayedReflector);
  app.delete('/api/v1/restaurants/:restaurantID/offers/:id', delayedReflector);

  app.post('/api/v1/restaurants', delayedReflector);

  app.get('/api/v1/login/facebook', function(req, res) {
    res.redirect('/#/admin');
  });
  app.get('/api/v1/register/facebook', function(req, res) {
    // res.status(401).send('uh oh');
    res.send('/#/admin');
  });
  app.get('/api/v1/logout', function(req, res) {
    res.redirect('/#/');
  });

  app.get('/api/v1/restaurants/:restaurantID/posts/:date', function(req, res) {
    // res.status(404).send('uh oh');
    res.send(JSON.stringify({
      _id: 123,
      message_template: "Tänased päevapakkumised on:",
      date: req.params.date,
    }));
  });
  app.post('/api/v1/restaurants/:restaurantID/posts', delayedReflector);
  app.put('/api/v1/restaurants/:restaurantID/posts/:date', delayedReflector);

  var publicDir = path.join(__dirname, '..', 'public');
  var apiDir = path.join(publicDir, 'api');
  app.use('/api', serveStatic(apiDir, {
    'index': 'index.json',
    'extensions': ['json'],
  }));
  app.use(serveStatic(publicDir));

  /**
   * Start Server
   */

  http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });

})();
