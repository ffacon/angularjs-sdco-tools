var gulp= require('gulp'),
  debug= require('gulp-debug'),
  gutil= require('gulp-util'),
  rimraf= require('gulp-rimraf'),
  uglify= require('gulp-uglify'),
  cssmin= require('gulp-minify-css'),
  concat= require('gulp-concat'),
  usemin=require('gulp-usemin'),
  gdocs= require('gulp-ngdocs'),
  myUtils= require('./utils');

var globs= myUtils.globs,
    appJsGlobs=globs.appJsGlobs,
    sampleJsGlobs=globs.sampleJsGlobs,
    appCssGlobs= globs.appCssGlobs,
    appImages= globs.appImages;  

var ghpages='ghpages';

//MANAGE GHPAGES CONTENT
gulp.task('clean', function (cb) {

  return gulp.src('./' + ghpages)
  .pipe(rimraf({force:true}));

});


gulp.task('ngdocs', ['clean'], function(cb){

  return gulp.src(appJsGlobs)
  .pipe(gdocs.process())
  .pipe(gulp.dest('./' + ghpages + '/doc/'));

});

gulp.task('usemin', ['clean'], function(){

  var sampleBase= 'src/e2eTemplates/',
      samples= [sampleBase + 'editor.html', sampleBase + 'notes.html'];

  // Usemin bug -> need to use unique ids, even if different files are used...
  // TODO: Wait for newer gulp-usemin version (0.3.10 now) and recheck
  // https://github.com/zont/gulp-usemin/issues/89
  return gulp.src(samples)
  .pipe(usemin({
    ext_css: [cssmin(), 'concat'],
    ext_css2: [cssmin(), 'concat'],
    lib_css: [cssmin(), 'concat'],
    lib_css2: [cssmin(), 'concat'],
    // ext_js: [uglify(), 'concat'],
    // ext_js2: [uglify(), 'concat'],
    // lib_js: [uglify(), 'concat'],
    // lib_js2: [uglify(), 'concat']    
    ext_js: ['concat'],
    ext_js2: ['concat'],
    lib_js: ['concat'],
    lib_js2: ['concat']
  }))
  .pipe(gulp.dest('./' + ghpages + '/sample/'));

});

gulp.task('copyResources', ['clean'], function(){

  var sampleBase= 'src/',
      resourcesGlobs= [sampleBase + 'imgs/**/*'];

  return gulp.src(resourcesGlobs, {base:sampleBase})
  .pipe(gulp.dest('./' + ghpages + '/sample/editor/'))
  .pipe(gulp.dest('./' + ghpages + '/sample/notes/'));
});


gulp.task('ghpages', ['ngdocs', 'usemin', 'copyResources']);
gulp.task('default', ['ghpages']);
