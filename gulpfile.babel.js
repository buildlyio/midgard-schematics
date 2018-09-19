'use strict';

import gulp from 'gulp';
import git from 'gulp-git';
import { spawn } from 'child_process';

gulp.task('clone', () => {
  git.clone('git@github.com:Humanitec/midgard-contacts.git', {args: './sub/folder'}, err => {
    if (err) {
      throw err;
    }
  });
});

 
gulp.task('schematics', (cb) => {
  const child = spawn('ng', ['g', '.:midgard-schematics:import-module', '--name=contacts']);
  
  let exit = {}

  child.on('exit', (code, signal) => {
    exit.code = code;
    exit.signal = signal;
  });

  child.on('error', (err) => {
    throw err;
  });

  child.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  child.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  if (!exit.code) {
    return cb();
  }
  else {
    throw `Schematics child process exited with code ${exit.code}, signal ${exit.signal}`;
  }
});