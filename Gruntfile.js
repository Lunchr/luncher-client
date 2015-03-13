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
    config.sed = {
      clean_lcov: {
        path: 'coverage/',
        pattern: 'SF:./',
        replacement: 'SF:',
        recursive: true
      }
    };
    config.coveralls = {
      options: {
        force: true,
        coverageDir: 'coverage',
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
  (function configurePostcss() {
    var browsers = ['ie >= 10, > 1%, last 2 versions'];
    config.postcss = {
      options: {
        map: true,
        processors: [
          require('postcss-import')(),
          require('postcss-mixins').postcss,
          require('postcss-simple-vars').postcss,
          require('postcss-nested').postcss,
          require('postcss-simple-extend').postcss,
          require('postcss-media-minmax')(),
          require('autoprefixer-core')({ browsers: browsers }).postcss,
          require('csswring').postcss,
          require('doiuse')({
            browsers: browsers,
            onFeatureUsage: function(usageInfo) {
              grunt.log.error(usageInfo.message);
            }
          }).postcss,
        ]
      },
      dist: {
        files: {
          'public/css/main.css': 'css/main.css'
        }
      }
    };
    config.watch.postcss = {
      files: ['css/*.css'],
      tasks: ['postcss:dist']
    };
  })();

  // Project configuration.
  grunt.initConfig(config);
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('e2e', ['shell:protractor_update', 'postcss:dist', 'express:dev', 'protractor:ci']);
  grunt.registerTask('once', ['jshint', 'karma:once']);
  grunt.registerTask('test', ['clean', 'bower:install', 'jshint', 'karma:ci', 'sed:clean_lcov', 'e2e', 'coveralls']);
  grunt.registerTask('predeploy', ['postcss:dist']);
  grunt.registerTask('dev', ['express:dev', 'watch:postcss']);

};
