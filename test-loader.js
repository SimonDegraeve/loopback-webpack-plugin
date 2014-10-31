/*
 * loopback-webpack-plugin
 * https://github.com/SimonDegraeve/loopback-webpack-plugin
 *
 * Copyright 2014, Simon Degraeve
 * Licensed under the MIT license.
 */

'use strict';

var glob = require('glob'),
    chai = require('chai'),
    pkg = require('./package.json');

global.expect = chai.expect;

// TODO Finish to write all the tests. 100% coverage would be nice.
// chai.use(require('sinon-chai'));
// global.sinon = require('sinon');

describe(pkg.name, function() {
  it('should initialize the tests', function(done) { done(); });

  glob.sync(__dirname + '/lib/**/__test__/*.js').map(function(path) {
    require(path);
  });
});
