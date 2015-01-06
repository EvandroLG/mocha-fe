#! /usr/bin/env node

'use strict';

var colors = require('colors');
var SpecRunner = require('./lib/spec-runner.js');
var server = require('./lib/server.js');
var Browser = require('./lib/browser.js');

var params = process.argv.slice(2);
var script = '<script src="{{ VALUE }}"></script>';
var spec = script.replace('{{ VALUE }}', params[0]);
var scripts = params.slice(1).map(function(value) {
  return script.replace('{{ VALUE }}', value);
});

SpecRunner.create(spec, scripts);
server(9000);
Browser.run('http://localhost:9000/' + SpecRunner.filename);