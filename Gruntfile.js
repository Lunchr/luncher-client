module.exports = function(grunt) {
  'use strict';

  var karmaSource = ['public/js/**/*.js'];
  var mochaSource = ['src/**/*.js'];
  var sourceFiles = karmaSource.concat(mochaSource);

  var configFiles = ['config/**/*.js'];

  var karmaTests = ['test/client/**/*.js'];
  var mochaTests = ['test/server/**/*.js'];
  var e2eTests = ['test/e2e/**/*.js'];
  var testFiles = karmaTests.concat(mochaTests).concat(e2eTests);

  var config = {};

  (function configureCommon() {
    config.pkg = grunt.file.readJSON('package.json');
    config.jshint = {
      options: {
        globals: {
          require: false
        }
      },
      tests: {
        options: {
          globals: {
            /* jasmine */
            describe: false,
            it: false,
            before: false,
            beforeEach: false,
            after: false,
            afterEach: false,
            expect: false,
            spyOn: false,
            /* angular */
            angular: false,
            module: false,
            inject: false,
            $: false,
            /* protractor */
            browser: false,
            by: false,
            element: false,
            /* local */
            utils: true,
            offerUtils: true
          },
          expr: true
        },
        files: {
          src: [testFiles]
        }
      },
      source: {
        files: {
          src: configFiles.concat(sourceFiles)
        }
      }
    };
    config.bower = {
      install: {}
    };
  })();

  (function configureTests() {
    config.watch = {
      karma: {
        files: karmaSource.concat(karmaTests),
        tasks: ['karma:dev:run']
      }
    };
    config.coveralls = {
      options: {
        force: true
      },
      mocha: {
        src: 'coverage/server/lcov.info'
      },
      karma: {
        src: 'coverage/client/**/lcov.info'
      }
    };
    (function configureKarma() {
      config.karma = {
        options: {
          configFile: 'config/karma.conf.js',
          preprocessors: {
            'public/partials/*.html': 'ng-html2js'
          }
        },
        once: {
          singleRun: true
        },
        ci: {
          singleRun: true,
          preprocessors: {
            'public/partials/*.html': 'ng-html2js',
            'public/js/**/*.js': ['coverage']
          },
          reporters: ['progress', 'coverage'],
          coverageReporter: {
            type: 'lcov',
            dir: 'coverage/client'
          }
        },
        dev: {
          background: true
        }
      };
    })();
    (function configureE2e() {
      config.connect = {
        server: {
          options: {
            port: 8080,
            base: 'public'
          }
        }
      };
      config.protractor = {
        options: {
          configFile: 'protractor.conf.js'
        },
        ci: {
          options: {
            keepAlive: false
          }
        }
      };
      config.shell = {
        protractor_update: {
          command: 'node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update'
        }
      };
    })();
    (function configureMocha() {
      config.mochacov = {
        options: {
          require: ['should'],
          files: mochaTests
        },
        once: {
          options: {
            reporter: 'spec'
          }
        },
        ci: {
          options: {
            instrument: true,
            reporter: 'mocha-lcov-reporter',
            output: 'coverage/server/lcov.info'
          }
        }
      };
    })();
  })();

  // Project configuration.
  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mocha-cov');

  grunt.registerTask('e2e', ['shell:protractor_update', 'connect:server', 'protractor:ci']);
  grunt.registerTask('once', ['jshint', 'karma:once', 'mochacov:once']);
  grunt.registerTask('test', ['bower:install', 'jshint', 'karma:ci', 'mochacov:ci', 'e2e', 'coveralls']);
  grunt.registerTask('dev', ['karma:dev', 'watch']);

};
