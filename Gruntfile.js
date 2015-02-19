module.exports = function(grunt) {
    'use strict';

    require('time-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
        ' <%= pkg.name %> <%= pkg.version %>\n' +
        ' Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> (<%= pkg.author.url %>)\n' +
        ' All rights reserved.\n' +
        ' <%= pkg.description %>\n' +
        '*/',

        clean: {
            start: ['tmp'],
            dist: ['dist'],
            end: ['tmp']
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                sourceMap: true,
                stripBanners: true
            },
            js: {
                src: [
                    'src/js/main.js'
                ],
                dest: 'dist/js/main.js'
            }
        },

        csslint: {
            dist: {
                options: {
                    csslintrc: 'tests/.csslintrc'
                },
                src: ['dist/css/main.css']
            }
        },

        cssmin: {
            dist: {
                files: {
                    'dist/css/main.min.css': ['dist/css/main.css']
                }
            }
        },

        copy: {
            testDist: {
                nonull: true,
                src: ['dist/js/main.js'],
                dest: 'tests/dist/js/main.js'
            }
        },

        header: {
            cssDist: {
                options: {
                    text: '<%= banner %>'
                },
                files: {
                    'dist/css/main.min.css': 'dist/css/main.min.css'
                }
            }
        },

        imagemin: {
            options: {
                pngquant: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/img/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'dist/img/'
                }]
            }
        },

        jshint: {
            options: {
                jshintrc: 'tests/.jshintrc'
            },
            dist: {
                src: ['src/js/*.js']
            }
        },

        uglify: {
            options: {
                preserveComments: 'some',
                report: 'min'
            },
            dist: {
                src: ['<%= concat.js.dest %>'],
                dest: 'dist/js/main.min.js'
            }
        },

        sass: {
            options: {
                // TODO: ['expanded' and 'compact' are not currently supported by libsass]
                outputStyle: 'expanded',
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/css/main.css': 'src/css/main.scss'
                }
            }
        },

        mocha: {
            options: {
                run: true
            },
            dist: {
                src: ['tests/dist.html']
            }
        },

        watch: {
            css: {
                files: ['src/css/**'],
                tasks: ['clean:start', 'css', 'clean:end']
            },
            js: {
                files: ['src/js/**'],
                tasks: ['clean:start', 'js', 'clean:end']
            },
            livereload: {
                options: {
                    livereload: 1337
                },
                files: ['dist/css/main.css', 'dist/js/main.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-header');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-sass');

    // Testing
    grunt.registerTask('test-css', ['csslint:dist']);
    grunt.registerTask('test-js', ['jshint:dist', 'copy:testDist', 'mocha:dist']);
    grunt.registerTask('test', ['test-css', 'test-js']);

    // CSS
    grunt.registerTask('css', ['sass:dist', 'test-css', 'cssmin:dist', 'header:cssDist']);

    // JS
    grunt.registerTask('js', ['concat:js', 'test-js', 'uglify']);

    // Images
    grunt.registerTask('images', ['imagemin:dist']);

    // Default task
    grunt.registerTask('default', ['clean:start', 'clean:dist', 'css', 'js', 'images', 'clean:end']);
};
