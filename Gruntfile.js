'use strict';
module.exports = function(grunt) {
    var path = require("path");
    var dirname = __dirname.split(path.sep)
    dirname.pop();
    dirname = dirname.pop();
    var branch = "dev"
    require('load-grunt-tasks')(grunt)
    var files = ["Gruntfile.js", "copyright.txt", "GruntfileBundle.js", "package.json", "dist/*.js", "coffee/*.coffee", "bower.json", "release.cmd", "commit.cmd", ".gitignore"]
    var message = "commit"
    grunt.initConfig({
        config: grunt.file.readJSON("bower.json"),
        version: {
            project: {
                src: ['bower.json', 'package.json']
            }
        },
        gitcheckout: {
            task: {
                options: {
                    branch: "<%= branch %>",
                    overwrite: true
                }
            }
        },
        concat: {
            coffee: {
                src: [target + 'coffee/<%= config.name %>.coffee'],
                dest: target + 'coffee/<%= config.name %>.coffee',
            },
            coffeebundle: {
                src: [config.coreFiles , target + 'coffee/<%= config.name %>.bundle.coffee'],
                dest: target + 'coffee/<%= config.name %>.bundle.coffee',
            }        
        },
        uglify: {
            options: {
                preserveComments: 'some',
                sourceMap : true,
                banner: '###!\n<%= config.name %> - v<%= config.version %> - ' +
                        ' <%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %> ' + '\n ' + grunt.file.read("copyright.txt") + '\n###'             
            },
            build: {
                src: config.dist.root + '/<%= config.name %>.js',
                dest: config.dist.root + '/<%= config.name %>.min.js'
            },
            bundle: {
                src: config.dist.root + '/<%= config.name %>.bundle.js',
                dest: config.dist.root + '/<%= config.name %>.bundle.min.js'
            }
        },
        gitadd: {
            firstTimer: {
                option: {
                    force: true
                },
                files: {
                    src: files
                }
            }
        },
        gitpull: {
            build: {
                option: {
                    join: true,
                    extDot: 'last'
                },
                dest: config.dist.root + '/<%= config.name %>.js',
                src: [target + 'coffee/<%= config.name %>.coffee']

            },
            bundle: {
                option: {
                    join: true,
                    extDot: 'last'
                },
                dest: config.dist.root + '/<%= config.name %>.bundle.js',
                src: [target + 'coffee/<%= config.name %>.bundle.coffee']

            }
        },
        copy: {
            bundle: {
                dest: config.dist.root + '/<%= config.name %>.config',
                src: [target + '<%= config.name %>.config']
            }
        }
    })
    grunt.registerTask('build', [
        'clean:build',
        'clean:bundlecoffee',
        'coffeescript_concat',
        'concat:coffeebundle',
        'coffee:bundle',
        'concat:coffee',
        'coffee:build',
        'uglify',
        'clean:postbuild',
        'copyVersion',
        'copy:bundle',
        'clean:bundlecoffee' //remove bundle.coffe file - not necessary
    ]);

    grunt.registerTask('copyVersion' , 'copy version from package.json to sarine.viewer.clarity.config' , function (){
        var packageFile = grunt.file.readJSON(target + 'package.json');
        var configFileName = target + packageFile.name + '.config';
        var copyFile = null;
        if (grunt.file.exists(configFileName))
            copyFile = grunt.file.readJSON(configFileName);
        
        if (copyFile == null)
            copyFile = {};

        copyFile.version = packageFile.version;
        grunt.file.write(configFileName , JSON.stringify(copyFile));
    });

    function decideDist()
    {
        if(process.env.buildFor == 'deploy')
        {
            grunt.log.writeln("dist is github folder");

            return {
                root: 'app/dist/'
            }
        }
        else
        {
            grunt.log.writeln("dist is local");

            return {
                root: '../../../dist/content/viewers/atomic/v1/js/'
            }
        }
    }

    function getCoreFiles()
    {
        var core;

        if(process.env.buildFor == 'deploy')
        {
            core = 
            [
                'node_modules/sarine.viewer/coffee/sarine.viewer.coffee'
            ]

            grunt.log.writeln("taking core files from node_modules");
        }
        else
        {
            core = 
            [
                '../../core/sarine.viewer/coffee/sarine.viewer.coffee'
            ]

            grunt.log.writeln("taking core files from parent folder");
        }

        return core;
    }
};