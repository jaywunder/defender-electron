var grunt = require('grunt');

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('watchify');

  grunt.initConfig({
    browserify: {
      options: {},
      files:[
        { src: ['index.js', 'js/*.js'], dest: 'js/bundle.js' }
      ]
    },
    // watchify: {
    //   options: {},
    //   files:[
    //     {src: ['coffee/*', /*'coffee/*.coffee'*/], dest: 'js/bundle.js'}
    //   ]
    // }
  });

  grunt.registerTask('default', ['browserify']);
};
