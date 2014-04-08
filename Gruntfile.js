module.exports = function(grunt) {
  'use strict';

  var jsFiles = 'public/js/**/*.js';
  var testFiles = 'test/**/*.js';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: true
      },
      all: ['*.js', 'config/**/*.js', jsFiles, testFiles]
    },
    karma: {
      options: {
        configFile: 'config/karma.conf.js'
      },
      once: {
        singleRun: true
      },
      ci: {
        singleRun: true,
        preprocessors: {
          'public/js/**/*.js': ['coverage']
        },
        reporters: ['progress', 'coverage'],
        coverageReporter: {
          type: "lcov",
          dir: "coverage/"
        }
      },
      dev: {
        background: true
      }
    },
    connect: {
      server: {
        options: {
          port: 8080,
          base: 'public'
        }
      }
    },
    protractor: {
      options: {
        configFile: 'protractor.conf.js'
      },
      ci : {
        options: {
          keepAlive: false
        }
      }
    },
    shell: {
      protractor_update: {
        command: 'node_modules/grunt-protractor-runner/node_modules/protractor/bin/webdriver-manager update'
      }
    },
    watch: {
      karma: {
        files: [jsFiles, testFiles],
        tasks: ['karma:dev:run']
      }
    },
    bower: {
      install: {}
    },
    coveralls: {
      options: {
        debug: true,
        coverage_dir: 'coverage',
        force: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma-coveralls');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('pre_push', ['jshint', 'karma:once']);
  grunt.registerTask('e2e', ['shell:protractor_update', 'connect:server', 'protractor:ci']);
  grunt.registerTask('test', ['bower:install', 'jshint', 'karma:ci', 'e2e', 'coveralls']);
  grunt.registerTask('dev', ['karma:dev', 'watch']);

};
