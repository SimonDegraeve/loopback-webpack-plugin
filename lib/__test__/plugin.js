/*
 * loopback-webpack-plugin
 * https://github.com/SimonDegraeve/loopback-webpack-plugin
 *
 * Copyright 2014, Simon Degraeve
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var rewire = require('rewire');
var webpack = require('webpack');
var LoopbackBootPlugin = rewire('../plugin');

// TODO Finish to write all the tests. 100% coverage would be nice.

describe('plugin', function() {
  it('should export a function', function(done) {
    expect(LoopbackBootPlugin).to.be.a('function');
    done();
  });

  it('should resolve and require a module', function(done) {
    var resolveAndRequire = LoopbackBootPlugin.__get__('resolveAndRequire');
    expect(resolveAndRequire('mocha/lib/test')).to.be.a('function');
    done();
  });

  it('should write config in a temp file', function(done) {
    var writeConfig = LoopbackBootPlugin.__get__('writeConfig');
    var config = {myConfig: 'myOptions'};
    var filePath = writeConfig(config);
    expect(fs.existsSync(filePath)).to.be.true;
    expect(fs.readFileSync(filePath, 'utf8')).to.equal(JSON.stringify(config));
    done();
  });
});

describe('webpack', function() {
  this.timeout(10000);

  it('should compile without errors/warnings', function(done) {
    var compiler = webpack({
      entry: __dirname + '/fixtures/myApp/client.js',
      output: {
        path: __dirname,
        filename: 'bundle.js'
      },
      module: {
        loaders: [
          {test: /\.json$/, loader: 'json'}
        ]
      },
      plugins: [new LoopbackBootPlugin()]
    });
    compiler.run(function(error, stats) {
      expect(error).to.be.null;
      var jsonStats = stats.toJson();
      expect(jsonStats.errors).to.have.length(0);
      expect(jsonStats.warnings).to.have.length(0);
      done();
    });
  });
});
