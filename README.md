# APF Participant Portal

This repo is built on the web starter kit (which is awesome!). See instructional notes below.

Use the following to run this locally.

```

gulp serve

```

## config.json

You need a config.json file in /app/scripts/core that has the format:

```
{
  "local": {
    "API_URI": "http://localhost:9000/salesforce",
    "DEBUG": true
  },
  "production": {
    "API_URI": "https://apiurl.com/salesforce",
    "DEBUG": false
  }
}
```

## Other stack resources

* Material design in Angular
    * https://material.angularjs.org/latest/
* Icons
    * https://material.io/tools/icons/?style=baseline
* Pug templating language
    * https://pugjs.org/api/getting-started.html

## Web Starter Kit notes

### Overview

[Web Starter Kit](https://developers.google.com/web/tools/starter-kit/) is an opinionated boilerplate for web development. Tools for building a great experience across many devices and [performance oriented](#web-performance). Helping you to stay productive following the best practices outlined in Google's [Web Fundamentals](https://developers.google.com/web/fundamentals/). A solid starting point for both professionals and newcomers to the industry.

### Docs and Recipes

* [File Appendix](https://github.com/google/web-starter-kit/blob/master/docs/file-appendix.md) - What do the different files here do?
* [Using Material Design Lite's Sass](https://github.com/google/web-starter-kit/blob/master/docs/mdl-sass.md) - how to get MDL's Sass working with WSK
* [Deployment guides](https://github.com/google/web-starter-kit/blob/master/docs/deploy.md) - available for Firebase, Google App Engine and other services.
* [Gulp recipes](https://github.com/gulpjs/gulp/tree/master/docs/recipes) - the official Gulp recipes directory includes a comprehensive list of guides for different workflows you can add to your project.

### Inspiration

Web Starter Kit is inspired by [Mobile HTML5 Boilerplate](https://html5boilerplate.com/mobile/) and Yeoman's [generator-gulp-webapp](https://github.com/yeoman/generator-webapp), having taken input from contributors to both projects during development. Our [FAQs](https://github.com/google/web-starter-kit/wiki/FAQ) attempt to answer commonly asked questions about the project.

### License

Apache 2.0  
Copyright 2015 Google Inc
