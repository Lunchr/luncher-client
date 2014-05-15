(function() {
  'use strict';
  var config = {
    dbAdress: process.env.PRAAD_DB_ADDRESS || 'mongodb://localhost/test',
    port: process.env.PORT || 8080
  };

  module.exports = config;
})();
