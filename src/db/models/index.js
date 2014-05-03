(function() {
  'use strict';
  var path = require('path');
  require('fs').readdirSync(__dirname).forEach(function(file) {
    if (file != 'indes.js') {
      exports[path.basename(file, '.js')] = require('./' + file);
    }
  });
})();
