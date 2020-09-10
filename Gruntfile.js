const path = require('path')
const modulePath =  path.join(__dirname, '../../')

module.exports = function(grunt) {
  const { peerDependencies } = grunt.file.readJSON("package.json")
  const peerDeps = Object.keys(peerDependencies)

  grunt.initConfig({
    copy: {
      deps: {
        files: [{
            expand: true,
            cwd: 'node_modules/',
            src: ['react/**', 'react-dnd/**', 'slate-react/**', 'react-dom/**'],
            dest: path.join(__dirname, '../../')
        }]
      }
    },
    clean: peerDeps.map((folder) => path.join(process.cwd(), `node_modules/${folder}`))
  });

  grunt.registerTask('clean:deps', 'Cleaning deps tree', function() {
    if (path.basename(modulePath) === 'node_modules') {
      grunt.task.run('copy');
      grunt.task.run('clean');
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('default', ['clean:deps']);
};