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
      all: ['Gruntfile.js', jsFiles, testFiles]
    },
    karma: {
      options: {
        configFile: 'config/karma.conf.js'
      },
      ci: {
        singleRun: true
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
        keepAlive: false
      }
    },
    shell: {
      protractor_update: {
        command: 'node_modules/protractor/bin/webdriver-manager update'
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
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('e2eTest', ['shell:protractor_update', 'connect:server', 'protractor:ci']);
  grunt.registerTask('test', ['bower:install', 'jshint', 'karma:ci', 'e2eTest']);
  grunt.registerTask('dev', ['karma:dev', 'watch']);

};
