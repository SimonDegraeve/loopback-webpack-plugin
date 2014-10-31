/*
 * loopback-webpack-plugin
 * https://github.com/SimonDegraeve/loopback-webpack-plugin
 *
 * Copyright 2014, Simon Degraeve
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var fs = require('fs');
var temp = require('temp').track();
var mockEmptyPath = 'webpack/node_modules/node-libs-browser/mock/empty';
var loopbackCompiler = resolveAndRequire('loopback-boot/lib/compiler');
var DefinePlugin = resolveAndRequire('webpack/lib/DefinePlugin');
var IgnorePlugin = resolveAndRequire('webpack/lib/IgnorePlugin');
var NormalModuleReplacementPlugin = resolveAndRequire('webpack/lib/NormalModuleReplacementPlugin');
var ContextReplacementPlugin = resolveAndRequire('webpack/lib/ContextReplacementPlugin');

module.exports = LoopbackBootPlugin;

function LoopbackBootPlugin(options) {
  // Same options as loopback-boot
  this.options = options || {};
}

LoopbackBootPlugin.prototype.apply = function(compiler) {
  var _this = this;

  // Default: Set the appRootDir to the last entry dirname
  var appRootDir = _this.options.appRootDir;
  if (!appRootDir) {
    var entry = compiler.options.entry;
    if (typeof entry === 'string') {
      appRootDir = path.dirname(entry);
    } else if (entry instanceof Array && entry.length > 0) {
      appRootDir = path.dirname(entry[entry.length - 1]);
    }
  }
  _this.options.appRootDir = path.resolve(process.cwd(), appRootDir || '');

  // Get compiled config from loopback and clean the absolute path
  _this.config = cleanPathInConfig(loopbackCompiler(_this.options));

  // Write config to a temp file
  _this.configPath = writeConfig(_this.config);

  // Get adapters from config
  _this.adapters = getAdaptersInConfig(_this.config);

  // Disable AMD => bugs with semver and eventemitter2
  new DefinePlugin({'define.amd': false}).apply(compiler);

  // Ignore middleware => only used for server
  new IgnorePlugin(/^\.\/express-middleware$/, new RegExp('loopback?')).apply(compiler);

  // Replacement
  [
    {regExp: /^loopback-boot#instructions$/, path: _this.configPath},
    {regExp: /^fs$/, path: mockEmptyPath},
    {regExp: /^ejs$/, path: 'ejs/ejs.js'}
  ].forEach(function(module) {
    new NormalModuleReplacementPlugin(module.regExp, module.path).apply(compiler);
  });

  var isModels = true;
  new ContextReplacementPlugin(/\./, function(result) {
    // Ignore useless modules
    if (/loopback\/lib(\/connectors)?$/.test(result.context) ||
        /loopback-datasource-juggler(\/lib)?$/.test(result.context)) {
      result.recursive = false;
      result.regExp = /^$/;
    }
    // Include remoting adapters
    if (/strong-remoting\/lib$/.test(result.context)) {
      result.recursive = false;
      result.regExp = new RegExp('^./(' + _this.adapters.join('|') + ')-adapter$');
    }
    // Include models/bootscripts and ignore middleware
    if (/loopback-boot\/lib$/.test(result.context)) {
      if (result.request === './middleware') {
        result.recursive = false;
        result.regExp = /^$/;
      } else {
        var items = isModels ? _this.config.models : _this.config.files.boot;
        var filePaths = items.filter(function(item) {
          return isModels ? typeof item.sourceFile !== 'undefined' : true;
        }).map(function(item) {
          return isModels ? item.sourceFile : item;
        });
        if (filePaths.length) {
          result.context = process.cwd();
          result.recursive = true;
          result.regExp = new RegExp('(' + filePaths.join('|') + ')$');
        }
        isModels = false;
      }
    }
  }).apply(compiler);

  // Remove warning that we are handling
  compiler.plugin('done', function(stats) {
    stats.compilation.warnings = stats.compilation.warnings.filter(function(warning) {
      var request = warning.module.request;
      return warning.name === 'CriticalDependenciesWarning' &&
        !/loopback\/lib\/(connectors\/mail|application)\.js$/.test(request) &&
        !/loopback-boot\/lib\/executor\.js$/.test(request) &&
        !/loopback-datasource-juggler\/(index|lib\/(datasource|utils))\.js$/.test(request);
    });
  });
};

function cleanPathInConfig(config) {
  config.files.boot.forEach(function(bootScript, index) {
    config.files.boot[index] = './' + path.relative(process.cwd(), bootScript);
  });
  config.models.forEach(function(model, index) {
    if (model.sourceFile) {
      config.models[index].sourceFile = './' + path.relative(process.cwd(), model.sourceFile);
    }
  });
  return config;
}

function getAdaptersInConfig(config) {
  return Object.keys(config.dataSources).filter(function(key) {
    return config.dataSources[key].connector === 'remote';
  }).map(function(key) {
    return config.dataSources[key].adapter || 'rest';
  });
}

function writeConfig(config) {
  var file = temp.openSync({prefix: 'loopback-config-', suffix: '.json'});
  fs.writeSync(file.fd, JSON.stringify(config));
  fs.closeSync(file.fd);
  return file.path;
}

function resolveAndRequire(module) {
  return require(path.resolve(process.cwd(), 'node_modules/' + module));
}
