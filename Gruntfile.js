module.exports = function (grunt) {

  var gruntPagesConfig = JSON.parse(grunt.template.process(grunt.file.read('cabin.json'), {
      data: {
        templateEngine: grunt.option('lang') || 'jade'
      }
    })).gruntPagesConfig;

  gruntPagesConfig.posts.options.templateEngine = grunt.option('lang') || 'jade';

  grunt.initConfig({
    pages: gruntPagesConfig,
    compass: {
      dist: {
        options: {
          sassDir: 'src/styles',
          cssDir: 'dist/styles'
        }
      }
    },
    // Move files not handled by other tasks
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'src',
          dest: 'dist',
          src: [
            'images/**',
            'scripts/**',
            'styles/**.css',
            'styles/fonts/**',
          ]
        }]
      }
    },
    watch: {
      dist: {
        files: ['dist/**'],
        options: {
          livereload: true
        }
      },
      compass: {
        files: ['src/styles/**'],
        tasks: ['compass']
      },
      pages: {
        files: [
          'posts/**',
          'src/layouts/**',
          'src/pages/**'
        ],
        tasks: ['pages']
      },
      copy: {
        files: [
          'src/images/**',
          'src/scripts/**',
          'src/styles/**.css',
          'src/styles/fonts/**'
        ],
        tasks: ['copy']
      }
    },
    connect: {
      dist: {
        options: {
        port: 5455,
        hostname: '0.0.0.0',
          middleware: function (connect) {
            return [
              require('grunt-contrib-livereload/lib/utils').livereloadSnippet,
              connect.static(require('path').resolve('dist'))
            ];
          }
        }
      }
    },
    open: {
      dist: {
        path: 'http://localhost:5455'
      }
    },
    clean: {
      dist: 'dist',
      engine: '.engineDiff'
    },
    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: ['**']
    },
    simplemocha: {
      options: {
        globals: ['should'],
        timeout: 600000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },
      install: {
        src: ['test/testThemeInstallation.js']
      }
    }
  });

  grunt.registerTask('build', function(target) {
    if (target === 'GHPages') {
      gruntPagesConfig.options.data.baseUrl = '/Blok/';
    }

    grunt.task.run([
      'clean',
      'pages',
      'compass',
      'copy'
    ]);
  });

  grunt.registerTask('deploy', [
    'build:GHPages',
    'gh-pages'
  ]);

  grunt.registerTask('server', [
    'build',
    'connect',
    'open',
    'watch'
  ]);

  grunt.registerTask('default', ['server']);

  grunt.registerTask('test', 'Test theme using node_modules in root folder rather than downloading from npm each time', function () {
    process.env['NODE_ENV'] = 'dev';
    grunt.task.run('testTheme');
  });

  grunt.registerTask('testTheme', ['clean', 'simplemocha']);

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);
};
