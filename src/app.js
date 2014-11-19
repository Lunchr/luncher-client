(function() {
  'use strict';
  /**
   * Module dependencies
   */

  var express = require('express'),
    http = require('http'),
    path = require('path'),
    api = require('./routes/api'),
    mongoose = require('mongoose'),
    config = require('./config'),
    failed = false;

  var app = module.exports = express();

  var connect = function() {
    var options = {
      server: {
        socketOptions: {
          keepAlive: 1
        }
      }
    };
    mongoose.connect(config.dbAdress, options);
  };
  connect();

  // Error handler
  mongoose.connection.on('error', function(err) {
    failed = true;
    console.error(err);
  });

  // Reconnect when closed
  mongoose.connection.on('disconnected', function() {
    if (!failed) connect();
  });


  /**
   * Configuration
   */

  var wrapAndCallIfNotFailed = function(f) {
    return function(_, __, next){
      if (!failed) f.apply(this, arguments);
      else next();
    }
  }

  app.get('/api/offers', wrapAndCallIfNotFailed(api.offers.get));
  app.get('/api/tags', wrapAndCallIfNotFailed(api.tags.get));

  app.set('port', config.port);
  app.use(express.static(path.join(__dirname, '..', 'public')));

  /**
   * Start Server
   */

  http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });

})();
