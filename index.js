#! /usr/bin/env node

'use strict';

var fs = require('fs');

var params = process.argv.slice(2);
var spec = params[0];
var tpScript = '<script src="{{ VALUE }}"></script>';
var scripts = params.slice(1).map(function(value) {
  return tpScript.replace('{{ VALUE }}', value);
});

var specRunner = 'SpecRunner.html';
fs.createReadStream('tmp/' + specRunner).pipe(fs.createWriteStream(specRunner));

fs.readFile(specRunner, 'utf-8', function(err, data) {
  var code = data.replace('{{ SPEC }}', spec);
  code = data.replace('{{ SCRIPTS }}', scripts.join(''));

  fs.writeFile(specRunner, code);
});