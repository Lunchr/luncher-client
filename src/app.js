
/**
 * Module dependencies
 */

var express = require('express'),
  http = require('http'),
  path = require('path');

var app = module.exports = express();


/**
 * Configuration
 */

app.set('port', process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, '..', 'public')));

/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
