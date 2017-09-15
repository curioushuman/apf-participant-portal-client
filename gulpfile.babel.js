/**
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

 // TODO
 // - make sure the scripts from bower have made it over
 // - concat your component JS as well (based on scripts task above), maybe app.js already is?

'use strict';

// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/

import path from 'path';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import swPrecache from 'sw-precache';
import gulpLoadPlugins from 'gulp-load-plugins';
import {output as pagespeed} from 'psi';
import pkg from './package.json';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// environment config
gulp.task('config_local', function () {
  gulp.src('app/scripts/core/config.json')
  .pipe($.ngConfig('app.core', {
    environment: 'local',
    templateFilePath: 'app/scripts/core/config.template.js'
  }))
  .pipe(gulp.dest('app/scripts/core'))
});
gulp.task('config_production', function () {
  gulp.src('app/scripts/core/config.json')
  .pipe($.ngConfig('app.core', {
    environment: 'production',
    templateFilePath: 'app/scripts/core/config.template.js'
  }))
  .pipe(gulp.dest('app/scripts/core'))
});

// Lint JavaScript
gulp.task('lint', () =>
  gulp.src(['app/scripts/**/*.js','!node_modules/**'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
);

// Optimize images
gulp.task('images', () =>
  gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}))
);

// Copy all files at the root level (app)
gulp.task('copy', () =>
  gulp.src([
    'app/*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    'app/styles/**/*.scss',
    'app/styles/**/*.css'
  ])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(gulp.dest('.tmp/styles'));
});

// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to enable ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
gulp.task('scripts', () =>
    gulp.src([
      // Note: Since we are not using useref in the scripts build pipeline,
      //       you need to explicitly list your scripts here in the right order
      //       to be correctly concatenated
      './app/scripts/main.js'
      // Other scripts
      // './app/scripts/app.module.js',
      //
      // './app/scripts/landing/registration.module.js',
      // './app/scripts/landing/config.route.js',
      // './app/scripts/landing/registration.controller.js',
      //
      // './app/scripts/core/core.module.js',
      // './app/scripts/core/constants.js',
      // './app/scripts/core/account.service.js',
      // './app/scripts/core/action.service.js',
      // './app/scripts/core/affiliation.service.js',
      // './app/scripts/core/contact.service.js',
      // './app/scripts/core/participant.service.js',
      // './app/scripts/core/question.service.js',
      // './app/scripts/core/response.service.js',
      //
      // './app/scripts/layout/layout.module.js',
      // './app/scripts/layout/layout.service.js',
      // './appscripts/layout/directives/completeFormSection.directive.js',
      // './appscripts/layout/directives/disabledFormSection.directive.js',
      // './appscripts/layout/directives/footer.directive.js',
      // './appscripts/layout/directives/navbar.directive.js',
      // './appscripts/layout/directives/responseFormInput.directive.js',
      // './appscripts/layout/directives/sliderFormInput.directive.js'
    ])
      .pipe($.newer('.tmp/scripts'))
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('dist/scripts'))
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.concat('main.min.js'))
      .pipe($.uglify({preserveComments: 'some'}))
      // Output files
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('dist/scripts'))
      .pipe(gulp.dest('.tmp/scripts'))
);

// bower
// gulp.task('bower', () =>
//   $.bower()
//     .pipe(gulp.dest('.tmp/scripts/lib'))
//     .pipe(gulp.dest('dist/scripts/lib'))
// );

// scan the views directory for pug files
gulp.task('pug_core', () =>
  gulp.src('views/**/*.pug')
  .pipe($.pug())
  .pipe(gulp.dest('dist'))
  .pipe(gulp.dest('.tmp'))
);

// scan the angular directories for pug files
gulp.task('pug_angular', () =>
  gulp.src('app/scripts/**/*.pug')
  .pipe($.pug())
  .pipe(gulp.dest(function(file) {
    return file.base;
  }))
);

// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe($.useref({
      searchPath: '{.tmp,app}',
      noAssets: true
    }))

    // Minify any HTML
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))
    // Output files
    .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
    .pipe(gulp.dest('dist'));
});

// Scan your HTML for assets & optimize them
gulp.task('copy_all_scripts', () => {
  return gulp.src('app/**/*.js')
    .pipe($.useref({
      searchPath: '{.tmp,app}',
      noAssets: true
    }))
    // Output files
    .pipe($.if('*.js', $.size({title: 'js', showFiles: true})))
    .pipe(gulp.dest('dist'));
});

// Clean output directory
gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

// Watch files for changes & reload
// gulp.task('serve', ['scripts', 'styles', 'pug_core', 'pug_angular'], () => {
gulp.task('serve', ['config_local', 'scripts', 'copy_all_scripts', 'styles', 'pug_core', 'pug_angular'], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app'],
    port: 3000
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
  // gulp.watch(['app/scripts/**/*.js'], ['lint', 'scripts', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['lint', 'scripts', 'copy_all_scripts', reload]);
  gulp.watch(['views/**/*.pug'], ['pug_core', reload]);
  gulp.watch(['app/scripts/**/*.pug'], ['pug_angular', reload]);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () =>
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist',
    port: 3001
  })
);

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'styles',
    // ['lint', 'pug_core', 'pug_angular', 'html', 'scripts', 'images', 'copy'],
    ['config_production', 'lint', 'pug_core', 'pug_angular', 'html', 'scripts', 'copy_all_scripts', 'images', 'copy'],
    'generate-service-worker',
    cb
  )
);

// Run PageSpeed Insights
gulp.task('pagespeed', cb =>
  // Update the below URL to the public URL of your site
  pagespeed('example.com', {
    strategy: 'mobile'
    // By default we use the PageSpeed Insights free (no API key) tier.
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb)
);

// Copy over the scripts that are used in importScripts as part of the generate-service-worker task.
gulp.task('copy-sw-scripts', () => {
  return gulp.src(['node_modules/sw-toolbox/sw-toolbox.js', 'app/scripts/sw/runtime-caching.js'])
    .pipe(gulp.dest('dist/scripts/sw'));
});

// See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
// an in-depth explanation of what service workers are and why you should care.
// Generate a service worker file that will provide offline functionality for
// local resources. This should only be done for the 'dist' directory, to allow
// live reload to work as expected when serving from the 'app' directory.
gulp.task('generate-service-worker', ['copy-sw-scripts'], () => {
  const rootDir = 'dist';
  const filepath = path.join(rootDir, 'service-worker.js');

  return swPrecache.write(filepath, {
    // Used to avoid cache conflicts when serving on localhost.
    cacheId: pkg.name || 'web-starter-kit',
    // sw-toolbox.js needs to be listed first. It sets up methods used in runtime-caching.js.
    importScripts: [
      'scripts/sw/sw-toolbox.js',
      'scripts/sw/runtime-caching.js'
    ],
    staticFileGlobs: [
      // Add/remove glob patterns to match your directory setup.
      `${rootDir}/images/**/*`,
      `${rootDir}/scripts/**/*.js`,
      `${rootDir}/styles/**/*.css`,
      `${rootDir}/*.{html,json}`
    ],
    // Translates a static file path to the relative URL that it's served from.
    // This is '/' rather than path.sep because the paths returned from
    // glob always use '/'.
    stripPrefix: rootDir + '/'
  });
});

// Load custom tasks from the `tasks` directory
// Run: `npm install --save-dev require-dir` from the command-line
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
