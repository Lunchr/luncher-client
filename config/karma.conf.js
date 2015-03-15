// Karma configuration
// Generated on Sat Mar 29 2014 14:07:21 GMT+0200 (EET)

module.exports = function(config) {
  'use strict';
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'public/lib/jquery/dist/*.js',
      'public/lib/angular/angular.js',
      'public/lib/angular-*/angular-*.js',
      'public/lib/ng-*/ng-*.js',
      'public/lib/timezone-js/src/date.js',
      'public/js/**/*.js',
      'test/client/**/*.js',
      'public/partials/*.html'
    ],

    // list of files to exclude
    exclude: [
      'public/lib/angular-loader/*',
      'public/lib/**/*.min.js',
      'public/lib/angular-scenario/*',
      '**/*.tmp'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor

    ngHtml2JsPreprocessor: {
      stripPrefix: 'public/',
      moduleName: 'partials'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
