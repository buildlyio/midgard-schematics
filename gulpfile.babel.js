'use strict';

import gulp from 'gulp';

const dirs = {
  src: 'src',
  dest: 'lib'
};

const paths = {
  src: 'src/**.js',
  dest: 'lib'
};

gulp.task('test', () => {
  return gulp.src(paths.src)
  .pipe(gulp.dest(paths.dest));
});