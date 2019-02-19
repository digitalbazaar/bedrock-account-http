'use strict';
/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */

module.exports = function(grunt) {
  grunt.initConfig({
    shell: {
      target: 'npm test'
    },
    watch: {
      files: ['**/*', '!node_modules/**/*'],
      tasks: ['shell']
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');
};
