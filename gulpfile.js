'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var istanbul = require('gulp-istanbul');

gulp.task('test', function() {
	return gulp.src(['./tests/**/*.js'], {read: false})
		.pipe(mocha({
			reporter: 'spec',
			bail: true
		}));
});

gulp.task('coverage', function(callback) {
	gulp.src(['./lib/**/*.js'])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on('finish', function() {
			gulp.src(['./tests/*.js'], {read: false})
				.pipe(mocha({
					reporter: 'spec',
					bail: true
				}))
				.pipe(istanbul.writeReports())
				.pipe(istanbul.enforceThresholds({thresholds: {global: 90}}))
				.on('end', callback);
		});
});

gulp.task('lint', function() {
	return gulp.src('./lib/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('unix'));
});

gulp.task('lintTests', function() {
	return gulp.src('./tests/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('unix'));
});
