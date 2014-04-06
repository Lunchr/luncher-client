exports.config = {
  baseUrl: 'http://localhost:8080',
  specs: ['test/e2e/*Spec.js']
};
if (process.env.TRAVIS){
  var sauceUser = process.env.SAUCE_USERNAME;
  var sauceKey = process.env.SAUCE_ACCESS_KEY;

  exports.config.sauceUser = sauceUser;
  exports.config.sauceKey = sauceKey;
  exports.config.seleniumAddress = 'http://' + sauceUser + ':' + sauceKey + '@localhost:4445/wd/hub';
  exports.config.capabilities = {
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER
  };
}
