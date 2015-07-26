
module.exports = function(grunt) {
    'use strict';

    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    var isDevMode,
        target = grunt.option('target'),
        testServerPort = 8080,
        cssTask,
        jsTask;

    switch (target) {
        case 'prod':
            /* falls through */
        case 'production':
            /* falls through */
        case 'staging':
            isDevMode = false;
            break;
        case 'dev':
            /* falls through */
        case 'development':
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

        browserSync: {
            dev: {
                bsFiles: {
                    src : [
                        'dist/css/**/*.css',
                        'dist/img/**',
                        'dist/js/**/*.js',
                        'dist/**/*.html'
                    ]
                },
                options: {
                    watchTask: true,
                    server: 'dist'
                }
            }
        },

        clean: {
            start: [],
            dist: [
                'dist/css',
                'dist/img',
                'dist/js'
            ],
            end: [
                'tmp'
            ]
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
            },
            initJs: {
                src: [
                    'tmp/js/modernizr.js'
                ],
                dest: 'dist/js/init.js'
            }
        },

        connect: {
            testServer: {
                options: {
                    hostname: 'localhost',
                    port: testServerPort,
                    base: 'tests/'
                }
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
                    'dist/css/main.css': [
                        'dist/css/main.css'
                    ]
                }
            }
        },

        copy: {
            setupTestsChai: {
                nonull: true,
                expand: true,
                cwd: 'src/libs/bower/chai',
                src: [
                    'chai.js'
                ],
                dest: 'tests/libs'
            },
            setupTestsMocha: {
                nonull: true,
                expand: true,
                cwd: 'src/libs/bower/mocha/',
                src: [
                    'mocha.js',
                    'mocha.css'
                ],
                dest: 'tests/libs'
            },
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
                    'dist/css/main.css': 'dist/css/main.css'
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

        modernizr: {
            dist: {
                devFile: 'src/libs/bower/modernizr/modernizr.js',
                outputFile: 'tmp/js/modernizr.js',
                uglify: false,
                extra : {},
                files: {
                    src: [
                        'dist/css/main.css',
                        'dist/js/main.js'
                    ]
                }
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
                dest: 'dist/js/main.js'
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
                options: {
                    urls: [
                        'http://localhost:' + testServerPort + '/index.html'
                    ]
                }
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
            }
        }
    });

    // First setup
    grunt.registerTask('setup-tests', [
        'copy:setupTestsChai',
        'copy:setupTestsMocha'
    ]);
    grunt.registerTask('setup', [
        'setup-tests'
    ]);

    // Testing
    grunt.registerTask('test-css', [
        'csslint:dist'
    ]);
    grunt.registerTask('test-js', [
        'jshint:dist',
        'copy:testDist',
        'connect',
        'mocha:dist'
    ]);
    grunt.registerTask('test', [
        'test-css',
        'test-js'
    ]);

    cssTask = [
        'sass:dist',
        'test-css'
    ];

    if (!isDevMode) {
        cssTask.push('cssmin:dist');
    }

    cssTask.push('header:cssDist');

    // CSS
    grunt.registerTask('css', cssTask);

    jsTask = [
        'concat:js',
        'modernizr:dist',
        'concat:initJs',
        'test-js'
    ];

    if (!isDevMode) {
        jsTask.push('uglify');
    }

    // JS
    grunt.registerTask('js', jsTask);

    // Images
    grunt.registerTask('images', [
        'imagemin:dist'
    ]);

    grunt.registerTask('serve', [
        'default',
        'browserSync',
        'watch'
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
