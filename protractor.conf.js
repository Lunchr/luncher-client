exports.config = {
  baseUrl: 'http://localhost:8080',
  specs: ['test/e2e/*Spec.js']
};
if (process.env.TRAVIS){
  exports.config.seleniumAddress = 'http://localhost:4445/wd/hub';
  exports.config.capabilities = {
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    'build': process.env.TRAVIS_BUILD_NUMBER
  };
}
