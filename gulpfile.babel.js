'use strict';

import gulp from 'gulp';
import git from 'gulp-git';

gulp.task('clone', () => {
  git.clone('git@github.com:Humanitec/midgard-contacts.git', {args: './sub/folder'}, err => {
    if (err) {
      throw err;
    }
  });
});