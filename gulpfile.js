/*
 * loopback-webpack-plugin
 * https://github.com/SimonDegraeve/loopback-webpack-plugin
 *
 * Copyright 2014, Simon Degraeve
 * Licensed under the MIT license.
 */

'use strict';

var exec = require('child_process').exec,
    gulp = require('gulp'),
    watch = require('gulp-watch'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    plumber = require('gulp-plumber'),
    coveralls = require('gulp-coveralls'),
    complexity = require('gulp-complexity'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    jscsStylish = require('jscs-stylish'),
    jshintStylish = require('jshint-stylish'),
    paths = {
      'src.scripts': 'lib/**/*.js',
      'src.tests': 'lib/**/__test__/*.js',
      'src.fixtures': 'lib/**/fixtures/**',
      'src.tests.loader': 'test-loader.js'
    };

gulp.task('check-updates', function(done) {
  exec('./node_modules/.bin/npm-check-updates', function(error, stdout, stderr) {
    if (stdout.indexOf('All dependencies match the latest package versions :)') === -1) {
      error = new Error('Dependencies can be updated.');
      console.log(stdout);
    }
    done(error);
  });
});

gulp.task('apply-updates', function(done) {
  exec('./node_modules/.bin/npm-check-updates -u', function(error, stdout, stderr) {
    if (stdout.indexOf('All dependencies match the latest package versions :)') !== -1) {
      return done(error);
    }
    if (stdout.indexOf('package.json upgraded') === -1) {
      error = new Error('Fail upgrading dependencies.');
      console.log(stdout);
    }
    done(error);
  });
});

gulp.task('coveralls', function() {
  gulp.src('./coverage/**/lcov.info')
    .pipe(coveralls());
});

gulp.task('test', ['lint'], function(done) {
  gulp.src([paths['src.scripts'], '!' + paths['src.tests'], '!' + paths['src.fixtures']])
    .pipe(istanbul({
      includeUntested: true
    }))
    .on('finish', function() {
      gulp.src(paths['src.tests.loader'], {read: false})
        // .pipe(plumber())
        .pipe(mocha())
        .pipe(istanbul.writeReports({
          dir: './coverage',
          reporters: ['lcov', 'text', 'text-summary']
        }))
        .on('end', done);
    });
});

gulp.task('watch:test', ['test'], function() {
  watch([paths['src.scripts'], paths['src.tests']], {name: 'src.tests', read: false}, function() {
    gulp.start('test');
  });
});

gulp.task('lint', function() {
  return gulp.src([paths['src.scripts'], paths['src.tests'], '!' + paths['src.fixtures']])
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jshint.reporter('fail'))
    .pipe(jscs())
    .pipe(jscs.reporter(jscsStylish))
    .pipe(jscs.reporter('fail'))
    .pipe(complexity({
      cyclomatic: [5, 15, 25],
      halstead: [15, 20, 25],
      maintainability: 100,
      breakOnErrors: false
    }));
});

gulp.task('default', ['test']);
