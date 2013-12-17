module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['js/*.js'],
				dest: 'js/dist/dist.js'
			}
		},
		uglify: {
			dist: {
				files: {
					'js/dist/dist.min.js': ['js/dist/dist.js']
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['concat', 'uglify']);
}