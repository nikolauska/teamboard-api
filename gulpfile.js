'use strict';


var gulp  = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');

function test(reporter) {

	reporter = reporter || 'dot';

	return function() {
		return gulp.src(['./test/**/*.js'])
			.pipe(mocha({
				reporter: reporter,
				globals: {
					should: require('should')
				}
			}).on('error', gutil.log));
	}
}

gulp.task('test',      test());
gulp.task('test-dot',  test('dot'));
gulp.task('test-spec', test('spec'));
gulp.task('test:exit', ['test-spec'], process.exit);

gulp.task('watch', ['test'], function() {
	return gulp.watch(['./**/*.js', '!./gulpfile.js'], ['test']);
});

gulp.task('default', ['watch']);
