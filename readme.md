# loopback-webpack-plugin

[![Build Status](https://travis-ci.org/SimonDegraeve/loopback-webpack-plugin.svg?branch=master)](https://travis-ci.org/SimonDegraeve/loopback-webpack-plugin) [![Coverage Status](https://img.shields.io/coveralls/SimonDegraeve/loopback-webpack-plugin.svg)](https://coveralls.io/r/SimonDegraeve/loopback-webpack-plugin) [![Dependencies Status](https://david-dm.org/SimonDegraeve/loopback-webpack-plugin.png)](https://david-dm.org/SimonDegraeve/loopback-webpack-plugin) [![npm version](https://badge.fury.io/js/loopback-webpack-plugin.svg)](http://badge.fury.io/js/loopback-webpack-plugin)

> Compile [Loopback](https://github.com/strongloop/loopback) project with [Webpack](https://github.com/webpack/webpack). This is useful for [isomorphic](http://strongloop.com/strongblog/full-stack-javascript-isomorphic-loopback-browse/) application.

Since the Loopback application should be compiled with `browserify`, a lot of errors/warnings occured when you want to use `webpack` instead. This plugin fix this bugs. It works with or without [loopback-boot](https://github.com/strongloop/loopback-boot), the convention-based bootstrapper for LoopBack applications.

## Usage
Install the module with: `npm install loopback-webpack-plugin`

```javascript
// client.js
// From the isomorphic example of Loopback.
// https://github.com/strongloop/loopback-example-full-stack

var loopback = require('loopback');
var boot = require('loopback-boot');

var client = module.exports = loopback();
boot(client);
```

```javascript
// webpack.config.js
var LoopbackBootPlugin = require('loopback-webpack-plugin');

module.exports = {
    entry: './client.js',
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            { test: /\.json$/, loader: 'json' } // Be careful, the JSON loader is required
        ]
    },
    plugins: [
      new LoopbackBootPlugin() // You can pass any loopback-boot options
                               // Default: appRootDir is the directory of the last entry
    ]
};
```

## Support
If you have any problem or suggestion please open an issue [here](https://github.com/SimonDegraeve/loopback-webpack-plugin/issues).

## License MIT

The MIT License

Copyright 2014, Simon Degraeve

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
