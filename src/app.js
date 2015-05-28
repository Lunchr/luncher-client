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
      res.send(req.body);
      // res.status(500).send('uh oh');
    }, 1000);
  };

  app.post('/api/v1/offers', delayedReflector);
  app.put('/api/v1/offers/:id', delayedReflector);
  app.delete('/api/v1/offers/:id', delayedReflector);

  app.post('/api/v1/restaurants', delayedReflector);

  app.get('/api/v1/login/facebook', function(req, res) {
    res.redirect('/#/admin');
  });
  app.get('/api/v1/register/login/facebook', function(req, res) {
    res.redirect('/#/register/pages');
  });
  app.get('/api/v1/logout', function(req, res) {
    res.redirect('/#/');
  });

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
