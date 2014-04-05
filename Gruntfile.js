module.exports = function(grunt) {

  var jsFiles = 'public/js/**/*.js';
  var testFiles = 'test/**/*.js';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
    jshint: {
      options: {
        jshintrc: true
      },
      all: ['Gruntfile.js', jsFiles, testFiles]
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'karma:ci']);
  grunt.registerTask('dev', ['karma:dev', 'watch']);

};
