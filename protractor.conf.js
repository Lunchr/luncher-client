exports.config = {
  baseUrl: 'http://localhost:8080',
  specs: ['test/e2e/*Spec.js']
}
if (process.env.TRAVIS){
  exports.config.sauceUser: process.env.SAUCE_USERNAME,
  exports.config.sauceKey: process.env.SAUCE_ACCESS_KEY,
  exports.config.capabilities: {
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER
    'build': process.env.TRAVIS_BUILD_NUMBER
  }
}
