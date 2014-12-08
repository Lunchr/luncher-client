module.exports = function(grunt) {
  'use strict';

  var karmaSource = ['public/js/**/*.js'];
  var sourceFiles = karmaSource;

  var configFiles = ['*.js', 'config/**/*.js'];

  var karmaTests = ['test/client/**/*.js'];
  var e2eTests = ['test/e2e/**/*.js'];
  var testFiles = karmaTests.concat(e2eTests);

  var config = {};

  (function configureCommon() {
    config.pkg = grunt.file.readJSON('package.json');
    config.clean = ['coverage'];
    config.jshint = {
      options: {
        globals: {
          require: true
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
      config: {
        options: {
          scripturl: true
        },
        files: {
          src: configFiles
        }
      },
      source: {
        files: {
          src: sourceFiles
        }
      }
    };
    config.bower = {
      install: {
        options: {
          copy: false
        }
      }
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
        force: true,
        coverage_dir: 'coverage',
        recursive: true
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
            dir: 'coverage'
          }
        },
        dev: {
          background: true
        }
      };
    })();
    (function configureE2e() {
      config.express = {
        dev: {
          options: {
            script: 'src/app.js',
            port: 8080
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
        protractor_update:  {
          command: 'node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update'
        }
      };
    })();
  })();

  // Project configuration.
  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-karma-coveralls');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('e2e', ['shell:protractor_update', 'express:dev', 'protractor:ci']);
  grunt.registerTask('once', ['jshint', 'karma:once']);
  grunt.registerTask('test', ['clean', 'bower:install', 'jshint', 'karma:ci', 'e2e', 'coveralls']);
  grunt.registerTask('dev', ['karma:dev', 'watch']);

};
