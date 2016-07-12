'use strict';

import gulp from 'gulp';
import del from 'del';
import webpack from 'webpack-stream';

gulp.task('set-dev-node-env', () => {
  // set environment variable
  return process.env.NODE_ENV = 'debug';
  // return process.env.NODE_ENV = 'production';
});

// clean out destination folders before rebuilding from source
gulp.task('clean', ['set-dev-node-env'], () => {
  return del(['./discorcabot.js']);
});

/**
 * stream webpack config with babel presets and optimizations
 *
 * bundle modules and dependencies
 * transpile ES6 to ES2015 via babel
 * mangle and uglify if NODE_ENV == 'production'
 * output to destination
 */
gulp.task('webpack', ['clean'], () => {
  return gulp.src('src/orcatail.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('./'));
});

// default task
gulp.task('default', ['webpack'], () => {
  // run `webpack` task on file changes
  gulp.watch([
    'cfg/**/*',
    'src/**/*',
    './webpack.config.js',
    './gulpfile.babel.js',
  ], ['webpack']);
});