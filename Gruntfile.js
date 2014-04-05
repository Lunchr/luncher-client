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
  grunt.loadNpmTasks('grunt-bower-task');

  grunt.registerTask('test', ['bower:install', 'jshint', 'karma:ci']);
  grunt.registerTask('dev', ['karma:dev', 'watch']);

};
