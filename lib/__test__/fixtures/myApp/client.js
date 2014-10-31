/*
 * loopback-webpack-plugin
 * https://github.com/SimonDegraeve/loopback-webpack-plugin
 *
 * Copyright 2014, Simon Degraeve
 * Licensed under the MIT license.
 */

'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var client = module.exports = loopback();

boot(client);
