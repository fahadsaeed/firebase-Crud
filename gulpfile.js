let gulp = require("gulp"),
  sass = require("gulp-sass"),
  browserSync = require("browser-sync").create(),
  uglify = require("gulp-uglify"),
  gulpIf = require("gulp-if"),
  del = require("del"),
  runSequence = require("run-sequence"),
  htmlmin = require("gulp-htmlmin"),
  cssnano = require("gulp-cssnano"),
  concat = require("gulp-concat"),
  postcss = require("gulp-postcss"),
  autoprefixer = require("autoprefixer"),
  babel = require("gulp-babel"),
  htmlreplace = require("gulp-html-replace"),
  inlineCss = require("gulp-inline-css"),
  replace = require("gulp-replace"),
  fs = require("fs");
let config = require("./config");
inject = require("gulp-inject");
const transform = (filePath, file) => {
  return file.contents.toString("utf8");
};

const injectOptions = {
  transform,
  quiet: true,
  endtag: "]]*/",
  removeTags: true
  // selfClosingTag: true
};

gulp.task("sass", function() {
  return gulp
    .src("src/sass/*.scss")
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(postcss([autoprefixer({ browsers: ["last 10 version"] })])) // add auto prefixer in css
    .pipe(gulp.dest("src/client/css"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task("script", () => {
    runSequence("concat:js", function() {
        console.log("script compile", new Date());
    });
});

gulp.task("concat:js", () => {
  return gulp
    .src(["src/js/firebase.js", "src/js/data.store.js", "src/js/app.js"])
      .pipe(replace("@@apikey@@", config.apiKey))
      .pipe(replace("@@authDomain@@", config.authDomain))
      .pipe(replace("@@databaseUrl@@", config.databaseURL))
      .pipe(replace("@@projectId@@", config.projectId))
      .pipe(replace("@@storageBucket@@", config.storageBucket))
      .pipe(replace("@@messageSenderId@@", config.messagingSenderId))
      .pipe(replace("@@appName@@", config.appName))
    .pipe(concat("index.js"))
    .pipe(gulp.dest("src/client/js/"));
});

gulp.task("serve", ["browserSync", "sass", "script"], function() {
  // Reloads the browser whenever CSS, HTML or JS files change
  gulp.watch("src/sass/**/*.scss", ["sass"]);
  gulp.watch("src/*.html", browserSync.reload);
  gulp.watch("src/js/**/*.js", ["script"], browserSync.reload);
});

gulp.task("browserSync", function() {
  browserSync.init({
    server: {
      baseDir: "src"
    }
  });
});
