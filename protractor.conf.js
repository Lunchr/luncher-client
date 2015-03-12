exports.config = {
  baseUrl: 'http://localhost:8080',
  specs: ['test/e2e/*Spec.js']
};
if (process.env.TRAVIS) {
  exports.config.seleniumAddress = 'http://localhost:4445/wd/hub';
  exports.config.capabilities = {
    'name': 'Travis CI',
    'username': process.env.SAUCE_USERNAME,
    'accessKey': process.env.SAUCE_ACCESS_KEY,
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER,
    'browserName': 'chrome'
  };
  // Pass results to SauceLabs
  exports.config.onPrepare = function() {
    jasmine.getEnv().addReporter(new jasmine.TerminalReporter({
      print: function() { /*Suppress logging*/ },
      onComplete: function(runner) {
        if (runner.results().failedCount === 0) {
          var SauceLabs = require('saucelabs');
          var sauceServer = new SauceLabs({
            username: process.env.SAUCE_USERNAME,
            password: process.env.SAUCE_ACCESS_KEY
          });
          browser.getSession().then(function(session) {
            sauceServer.updateJob(session.getId(), {
              passed: true
            }, function(error, response) {
              console.log('SauceLab callback called');
              if (error) {
                console.error(error);
              } else {
                console.log(response);
              }
            });
          });
        }
      }
    }));
  };
}
