module.exports = function(grunt){

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
options: {
banner: '/*!\n'
+'* <%= pkg.name %> v<%= pkg.version %>\n'
+'* <%= pkg.description %>\n'
+'* <%= pkg.site %>\n'
+'*\n'
+'* Copyright 2012, <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n'
+'* Released under the <%= pkg.license.type %> license\n'
+'* <%= pkg.license.url %>\n'
+'*\n'
+'* Date: <%= (new Date()).toString() %>\n'
+'*/\n\n'
},
			main: {
				src: [
					'src/PV.js',
					'src/*.js'
				],
				dest: 'dist/PiVas.js'
			},
		},

		uglify: {
			main: {
				files: {
					'dist/PiVas.min.js': '<%= concat.main.dest %>'
				}				
			}
		},

		connect: {
			server: {
				options: {
					port: 8714,
					base: 'example'
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-connect');
	grunt.registerTask('default', ['concat', 'uglify']);
	grunt.registerTask('dev', ['concat']);
	grunt.registerTask('prod', ['concat', 'uglify']);

};
