"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const babel = require('gulp-babel');

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  '\n'
].join('');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    port: 3000
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean vendor
function clean() {
  return del(["./vendor/", "./dist/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
  var mdb = gulp.src([
    "./external/mdb/js/*.js"
  ])
    .pipe(gulp.dest("./vendor/mdbjs"));
  var mdbaddons = gulp.src([
    "./external/mdb/js/addons/*.js"
  ])
    .pipe(gulp.dest("./vendor/mdbjs/addons"));
  var mdbmodules = gulp.src([
    "./external/mdb/js/modules/*.js"
  ])
    .pipe(gulp.dest("./vendor/mdbjs/modules"));
  var mdbstyles = gulp.src([
    "./external/mdb/css/*.css"
  ])
    .pipe(gulp.dest("./vendor/mdbcss"));
  var mdbstylesaddons = gulp.src([
    "./external/mdb/css/addons/*.css"
  ])
    .pipe(gulp.dest("./vendor/mdbcss/addons"));
  var mdbstylesmodules = gulp.src([
    "./external/mdb/css/modules/*.css"
  ])
    .pipe(gulp.dest("./vendor/mdbcss/modules"));

  return merge(mdb, mdbaddons, mdbmodules, mdbstyles, mdbstylesaddons, mdbstylesmodules);
}

// CSS task
function css() {
  return gulp
    .src([
      "./scss/**/*.scss",
      "./external/**/*.scss"
    ])
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded",
      includePaths: "./external",
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest("./css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./css"))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return gulp
    .src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(babel({
      presets: ["env"]
    }))
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(concat("main.bundle.js"))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
  gulp.watch(["./scss/**/*", "./external/mdb/**/*"], css);
  gulp.watch(["./js/**/*", "!./js/**/*.min.js"], js);
  gulp.watch("./**/*.html", browserSyncReload);
}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
