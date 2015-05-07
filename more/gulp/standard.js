
var gulp= require('gulp'),
  debug= require('gulp-debug'),
  gutil= require('gulp-util'),
	karma = require('gulp-karma'),
  rimraf= require('gulp-rimraf'),
  jshint= require('gulp-jshint'),
  jshintStylish= require('jshint-stylish'),
  uglify= require('gulp-uglify'),
  cssmin= require('gulp-minify-css'),
  concat= require('gulp-concat'),
  mbf= require('main-bower-files'),
  addSrc= require('gulp-add-src'),
  gfilter= require('gulp-filter'),
  rename= require('gulp-rename'),
  gdocs= require('gulp-ngdocs'),
  gheader= require('gulp-header'),
  protractor= require('gulp-protractor').protractor,
  webdriver_standalone = require('gulp-protractor').webdriver_standalone,
  webdriver_update = require('gulp-protractor').webdriver_update,
  myUtils= require('./utils'),
  server= myUtils.getServer();

var globs= myUtils.globs,
    appJsGlobs=globs.appJsGlobs,
    unitTestJsGlobs=globs.unitTestJsGlobs,
    e2eJsGlobs= globs.e2eJsGlobs,
    appCssGlobs= globs.appCssGlobs,
    appImages= globs.appImages;

var target='dist',
    targetAppName= myUtils.getPackage().name;

/**
* When used, this task launches the selenium
* server and let it run indefinitely
*/

gulp.task('webdriver_update', webdriver_update);
gulp.task('webdriver_standalone', webdriver_standalone);

gulp.task('express', function(cb){
  server.listen(8080, cb);
});


gulp.task('test-unit', function() {

  //Check files to test
  var filesToTest= myUtils.getFilesForPatterns(unitTestJsGlobs);
  if (!filesToTest){
    return;
  }

  var jsFilter= gfilter('**/*.js');
  
  //Stream all devDependencies js referenced by bower
  return gulp.src(mbf({includeDev:'exclusive'}))
  //Stream all dependencies js referenced by bower
  .pipe(addSrc.append(mbf()))
  .pipe(jsFilter)
  //Then add application specific js
  .pipe(addSrc.append(appJsGlobs))
  //Then add unit tests specific js
  .pipe(addSrc.append(filesToTest))
  //Finally run karma unit tests
  .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run',
      singleRun: false
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
});


gulp.task('jshint', function(){

  //Apply jshint rules on application files only
  return gulp.src(appJsGlobs)
  .pipe(jshint({multistr: true}))
  .pipe(jshint.reporter(jshintStylish));

});

gulp.task('test-e2e', ['webdriver_update', 'express'],  function(cb){

  //Check files to test
  var filesToTest= myUtils.getFilesForPatterns(e2eJsGlobs);
  if (filesToTest===undefined || filesToTest.length===0){
    server.close();
    cb();
    return;
  }

  //start protractor
  gulp.src(filesToTest, { read:false })
      .pipe(protractor({
        configFile: './protractor.conf.js',
        args: ['--baseUrl', 'http://localhost:' + server.address().port +'/e2eTemplates/']
      })).on('error', function(e) {
        server.close();
        throw e;
        cb();
      }).on('end', function() {
        server.close();
        cb();
      });
});

gulp.task('ngdocs', function(cb){

  return gulp.src(appJsGlobs)
  .pipe(gdocs.process())
  .pipe(gulp.dest('./reports/doc/'));

});


gulp.task('prebuild', ['test-unit', 'jshint', 'test-e2e', 'ngdocs'], function(cb){
  cb();
});


//BUILD PART

gulp.task('clean', ['prebuild'], function (cb) {
  return gulp.src('./' + target)
  .pipe(rimraf({force:true}));
});

gulp.task('minifyJs', ['prebuild', 'clean'],  function(){

  gulp.src(appJsGlobs) 
  .pipe(concat( targetAppName + '.js'))
  .pipe(gheader(myUtils.getHeaders()))
  .pipe(gulp.dest('./' + target + '/js/')) //not minified
  .pipe(uglify())
  .pipe(gheader(myUtils.getHeaders()))
  .pipe(rename(targetAppName + '-min.js'))
  .pipe(gulp.dest('./' + target + '/js/')); //minified

});

gulp.task('minifyCss',['prebuild', 'clean'],  function(){

  gulp.src(appCssGlobs)
  .pipe(concat(targetAppName + '.css'))
  .pipe(gheader(myUtils.getHeaders()))
  .pipe(gulp.dest('./' + target + '/styles/'))
  .pipe(cssmin())
  .pipe(gheader(myUtils.getHeaders()))
  .pipe(rename(targetAppName + '-min.css'))
  .pipe(gulp.dest('./' + target + '/styles/'));

});

gulp.task('images', ['prebuild', 'clean'],  function(){
  gulp.src(appImages)
  .pipe(gulp.dest('./' + target + '/imgs'));
});


gulp.task('build', ['minifyJs','minifyCss', 'images'], function(cb){
  cb();
});

gulp.task('default', ['build']);