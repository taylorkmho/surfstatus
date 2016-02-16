var del = require('del');
var fs = require('fs');
var browsersync = require('browser-sync');
var gulp = require('gulp');
var filter = require('gulp-filter');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var rsync = require('gulp-rsync');
var gzip = require('gulp-gzip');
var gutil = require('gulp-util');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var bower = require('main-bower-files');
var order = require('gulp-order');
var include = require('gulp-include');
var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var lost = require('lost');
var cssnext = require('cssnext');
var postcss = require('gulp-postcss');
var postcssimport = require('postcss-import');
var postcssnested = require('postcss-nested');
var postcssfocus = require('postcss-focus');
var postcsspxtorem = require('postcss-pxtorem');
var postcsscolorfunction = require('postcss-center');
var postcsssimplevars = require('postcss-simple-vars');
var postcsssimpleextend = require('postcss-simple-extend');

var paths = {
  base: {
    root: '',
    src: './src',
    dist: './public',
    tmp: './tmp'
  }
};

paths.src = {
  css: paths.base.src + '/css',
  js: paths.base.src + '/js',
  images: paths.base.src + '/images'
};

paths.dist = {
  css: paths.base.dist + '/css',
  js: paths.base.dist + '/js',
  vendorjs: paths.base.dist + '/js/vendor',
  images: paths.base.dist + '/images'
};

var watching = false;

var ERROR_LEVELS = ['error', 'warning'];

var isFatal = function(level) {
  return ERROR_LEVELS.indexOf(level) <= ERROR_LEVELS.indexOf(fatalLevel || 'error');
};

var handleError = function(level, error) {
  gutil.log(error.message);
  if (watching) {
    return this.emit('end');
  } else {
    return process.exit(1);
  }
};

var onError = function(error) {
  return handleError.call(this, 'error', error);
};

var onWarning = function(error) {
  return handleError.call(this, 'warning', error);
};

var deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath;
      curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        return deleteFolderRecursive(curPath);
      } else {
        return fs.unlinkSync(curPath);
      }
    });
    return fs.rmdirSync(path);
  }
};

gulp.task('clean', function() {
  return deleteFolderRecursive(paths.base.dist);
});

gulp.task('bower', function() {
  return gulp.src(bower()).pipe(filter('*.js')).pipe(uglify()).pipe(gulp.dest(paths.dist.vendorjs)).on('error', onError);
});

gulp.task('js', function() {
  gulp.src(paths.src.js + "/*.js").pipe(order(["helpers.js", "application.js"])).pipe(include().on('error', onError)).pipe(concat('app.js')).pipe(sourcemaps.init()).pipe(uglify().on('error', onError)).pipe(sourcemaps.write('maps')).pipe(gulp.dest(paths.dist.js)).on('error', onError);
  return gulp.src(paths.src.js + "/vendor/*.js").pipe(gulp.dest(paths.dist.vendorjs));
});

gulp.task('css', function() {
  var postCSSProcessors;
  postCSSProcessors = [
    postcssimport({
      from: paths.src.css + "/app.css"
    }), postcssnested, postcssfocus, postcsscolorfunction, postcsspxtorem, postcsssimplevars, postcsssimpleextend, lost, cssnext({
      compress: false,
      autoprefixer: {
        browsers: ['last 1 version']
      }
    })
  ];
  return gulp.src(paths.src.css + "/**/[^_]*.{css,scss}").pipe(concat('app.css')).pipe(sourcemaps.init()).pipe(postcss(postCSSProcessors).on('error', onError)).pipe(cssnano({
    browsers: ['last 1 version']
  })).pipe(sourcemaps.write('maps')).pipe(gulp.dest(paths.dist.css)).on('error', onError);
});

gulp.task('images', function() {
  return gulp.src(paths.src.images + "/**/*.{gif,jpg,png}").pipe(changed(paths.dist.images)).pipe(imagemin({
    optimizationLevel: 3
  })).pipe(gulp.dest(paths.dist.images));
});

gulp.task('browsersync', function() {
  browsersync.use({
    plugin: function() {},
    hooks: {
      'client:js': fs.readFileSync("./lib/closer.js", "utf-8")
    }
  });
  return browsersync.init([paths.dist.css, paths.dist.js]);
});

gulp.task('watch', ['browsersync'], function() {
  watching = true;
  gulp.watch([paths.base.src + "/*.*", paths.base.src + "/data/**/*"], ['static-files']);
  gulp.watch(paths.src.css + "/**/*", ['css']);
  gulp.watch(paths.src.js + "/**/*.{js,coffee}", ['js']);
  return gulp.watch(paths.src.images + "/**/*.{gif,jpg,png}", ['images']);
});

gulp.task('refresh', ['clean', 'build']);

gulp.task('build', ['bower', 'js', 'css', 'images']);

gulp.task('default', ['bower', 'refresh', 'watch']);