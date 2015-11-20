var gulp = require('gulp')
var browserify = require('browserify')
var source = require('vinyl-source-stream')

gulp.task('default', function () {
    return browserify('./lib/frp.js', {bundleExternal: false})
               .bundle()
               .pipe(source('frpjs-bundle.js'))
               .pipe(gulp.dest('./lib/'))
})