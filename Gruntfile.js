module.exports = function (grunt) {


    // Project configuration.
    grunt.initConfig({
        // sprite 이미지스트라이프 자동화 css 자동화 개꿀 //
        sprite: {
            all: {
                src: './public/league/league_mobile/images/*.png',
                dest: './public/league/league_mobile/icon_set.png',
                destCss: './public/league/league_mobile/sprites.css'
            }
        },
        responsive_images: {
            myTask: {
                options: {},
                files: {
                    './public/league/league_pc/images/class1_on.png': './public/league/league_pc/class1_on.png'
                }
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        //uglify 설정
        uglify: {
            options: {
                banner: '/* <%= grunt.template.today("yyyy-mm-dd") %> / ' //파일의 맨처음 붙는 banner 설정
            },
            build: {
                src: 'public/build/result.js', //uglify할 대상 설정
                dest: 'public/build/result.min.js' //uglify 결과 파일 설정
            }
        },
        //concat 설정
        concat: {
            basic: {
                src: ['public/js/common/util.js', 'public/js/app.js', 'public/js/lib/.js', 'public/js/ctrl/.js'],
                dest: 'public/build/result.js' //concat 결과 파일
            }
        }
    });

    // Load the plugin that provides the "uglify", "concat" tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    // 이미지 스트라이프 자동화 //
    grunt.loadNpmTasks('grunt-spritesmith');
    // 반응형 이미지 ? //
    grunt.loadNpmTasks('grunt-responsive-images');
    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']); //grunt 명령어로 실행할 작업

};