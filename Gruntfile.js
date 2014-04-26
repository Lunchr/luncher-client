module.exports = function(grunt) {
  'use strict';

  var jsFiles = 'public/js/**/*.js';
  var testFiles = 'test/**/*.js';

  var config = {};

  (function configureCommon() {
    config.pkg = grunt.file.readJSON('package.json');
    config.jshint = {
      options: {
        jshintrc: true
      },
      all: ['*.js', 'config/**/*.js', jsFiles, testFiles]
    };
    config.bower = {
      install: {}
    };
  })();

  (function configureTests() {
    config.watch = {
      karma: {
        files: [jsFiles, testFiles],
        tasks: ['karma:dev:run']
      }
    };
    config.coveralls = {
      options: {
        debug: true,
        coverage_dir: 'coverage',
        force: true
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
            dir: 'coverage/'
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
          files: ['test/server/**/*.js']
        },
        once: {
          options: {
            reporter: 'spec'
          }
        },
        ci: {
          options: {
            coveralls: true
          }
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
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mocha-cov');

  grunt.registerTask('pre_push', ['jshint', 'karma:once']);
  grunt.registerTask('e2e', ['shell:protractor_update', 'connect:server', 'protractor:ci']);
  grunt.registerTask('test', ['bower:install', 'jshint', 'karma:ci', 'mochacov:ci', 'e2e', 'coveralls']);
  grunt.registerTask('dev', ['karma:dev', 'watch']);

};
