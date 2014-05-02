
/**
 * Module dependencies
 */

var express = require('express'),
  http = require('http'),
  path = require('path'),
  api = require('./routes/api');

var app = module.exports = express();


/**
 * Configuration
 */

app.set('port', process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/offers', api.offers.get);

/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
