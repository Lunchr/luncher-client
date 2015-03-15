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

  app.use(bodyParser.json());
  app.post('/api/v1/offers', function(req, res) {
    setTimeout(function() {
      res.send(req.body);
    }, 1000);
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
