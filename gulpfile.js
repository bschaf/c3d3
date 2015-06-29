var gulp = require('gulp'),
  $ = require('gulp-load-plugins')();

gulp.task('bundle', function () {
  gulp.src('app/components/index.js')
    .pipe($.browserify({
      insertGlobals : true
    }))
    .pipe($.rename('app.js'))
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('watch', function () {
  gulp.watch('app/components/**.*js', ['bundle']);
});
