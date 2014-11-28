'use strict';

var gulp  = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');

gulp.task('test', function() {
	return gulp.src( ['./test/**/*.js'] )
		.pipe(mocha({
			'timeout':  10000,
			'reporter': 'spec',
			'globals': {
				'should': require('should')
			}
		}).on('error', gutil.log));
});

gulp.task('test:exit', ['test'], process.exit);

gulp.task('watch', ['test'], function() {
	return gulp.watch(['./**/*.js',
		'!./gulpfile.js',
		'!./node_modules/**/*.js',
	], ['test']);
});

gulp.task('default', ['watch']);
