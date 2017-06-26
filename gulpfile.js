var cleanCss = require("gulp-clean-css");
var concat = require("gulp-concat");
var del = require("del");
var filesExist = require("files-exist");
var gulp = require("gulp");
var htmlMin = require("gulp-htmlmin");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");
var webpack = require("webpack-stream");
var srcOut = "dist";
var testOut = "dist.test";

gulp.task("default", ["clean"], function() {
	gulp.start("src", "test");
});

gulp.task("clean", function() {
	return del([srcOut, testOut]);
});

gulp.task("src", ["src.css", "src.html", "src.js", "src.lib"]);

gulp.task("src.css", function() {
	return gulp.src("src/css/**/*.scss")
		.pipe(sass())
		.pipe(cleanCss())
		.pipe(gulp.dest(srcOut));
});

gulp.task("src.html", function() {
	return gulp.src("src/**/*.html")
		.pipe(htmlMin({
			collapseInlineTagWhitespace: true,
			collapseWhitespace: true
		}))
		.pipe(gulp.dest(srcOut));
});

gulp.task("src.js.webpack", function() {
	return gulp.src("src/js/index.js")
		.pipe(webpack({
			devtool: "source-map",
			output: {
				filename: "app.js"
			}
		}))
		.pipe(gulp.dest(srcOut));
});

gulp.task("src.js", ["src.js.webpack"], function() {
	return gulp.src(srcOut + "/app.js")
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(uglify())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(srcOut));
});

gulp.task("src.lib", function() {
	return gulp.src(filesExist([
			"node_modules/mithril/mithril.min.js"
		])).pipe(concat("lib.js"))
		.pipe(gulp.dest(srcOut));
});

gulp.task("test", ["test.css", "test.html", "test.js", "test.lib"]);

gulp.task("test.css", function() {
	return gulp.src(filesExist([
			"node_modules/mocha/mocha.css"
		])).pipe(concat("lib.css"))
		.pipe(gulp.dest(testOut));
});

gulp.task("test.html", function() {
	return gulp.src("test/**/*.html")
		.pipe(gulp.dest(testOut));
});

gulp.task("test.js", function() {
	return gulp.src("test/js/index.js")
		.pipe(webpack({
			devtool: "source-map",
			output: {
				filename: "app.js"
			}
		}))
		.pipe(gulp.dest(testOut));
});

gulp.task("test.lib", function() {
	return gulp.src(filesExist([
			"node_modules/mocha/mocha.js",
			"node_modules/chai/chai.js"
		])).pipe(concat("lib.js"))
		.pipe(gulp.dest(testOut));
});
