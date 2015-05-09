
module.exports = function(grunt) {
    'use strict';

    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    var isDevMode,
        target = grunt.option('target');

    switch (target) {
        case 'live':
            /* falls through */
        case 'staging':
            isDevMode = false;
            break;
        case 'dev':
            /* falls through */
        default:
            isDevMode = true;
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        banner: '/*!\n' +
        ' <%= pkg.name %> <%= pkg.version %>\n' +
        ' Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> (<%= pkg.author.url %>)\n' +
        ' All rights reserved.\n' +
        ' <%= pkg.description %>\n' +
        '*/',

        clean: {
            start: [],
            dist: [
                'dist'
            ],
            end: []
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                sourceMap: isDevMode,
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
                src: [
                    'dist/css/main.css'
                ]
            }
        },

        cssmin: {
            dist: {
                files: {
                    'dist/css/main.min.css': [
                        'dist/css/main.css'
                    ]
                }
            }
        },

        copy: {
            testDist: {
                nonull: true,
                src: [
                    'dist/js/main.js'
                ],
                dest: 'tests/dist/js/main.js'
            }
        },

        header: {
            cssDist: {
                options: {
                    text: isDevMode ? '' : '<%= banner %>'
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
                    src: [
                        '**/*.{png,jpg,gif}'
                    ],
                    dest: 'dist/img/'
                }]
            }
        },

        jshint: {
            options: {
                jshintrc: 'tests/.jshintrc'
            },
            dist: {
                src: [
                    'src/js/*.js'
                ]
            }
        },

        uglify: {
            options: {
                preserveComments: 'some',
                report: 'min'
            },
            dist: {
                src: [
                    '<%= concat.js.dest %>'
                ],
                dest: 'dist/js/main.min.js'
            }
        },

        sass: {
            options: {
                // TODO: ['expanded' and 'compact' are not currently supported by libsass]
                outputStyle: isDevMode ? 'expanded' : 'compressed',
                sourceMap: isDevMode
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
                src: [
                    'tests/dist.html'
                ]
            }
        },

        watch: {
            css: {
                files: [
                    'src/css/**'
                ],
                tasks: [
                    'clean:start',
                    'css',
                    'clean:end'
                ]
            },
            js: {
                files: [
                    'src/js/**'
                ],
                tasks: [
                    'clean:start',
                    'js',
                    'clean:end'
                ]
            },
            livereload: {
                options: {
                    livereload: 1337
                },
                files: [
                    'dist/css/main.css',
                    'dist/js/main.js'
                ]
            }
        }
    });

    // Testing
    grunt.registerTask('test-css', [
        'csslint:dist'
    ]);
    grunt.registerTask('test-js', [
        'jshint:dist',
        'copy:testDist',
        'mocha:dist'
    ]);
    grunt.registerTask('test', [
        'test-css',
        'test-js'
    ]);

    // CSS
    grunt.registerTask('css', [
        'sass:dist',
        'test-css',
        'cssmin:dist',
        'header:cssDist'
    ]);

    // JS
    grunt.registerTask('js', [
        'concat:js',
        'test-js',
        'uglify'
    ]);

    // Images
    grunt.registerTask('images', [
        'imagemin:dist'
    ]);

    // Default task
    grunt.registerTask('default', [
        'clean:start',
        'clean:dist',
        'css',
        'js',
        'images',
        'clean:end'
    ]);
};
