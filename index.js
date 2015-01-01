#! /usr/bin/env node

'use strict';

var fs = require('fs');
var phantom = require('phantom');
var server = require('./lib/server.js');

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

server(9000);

var url = 'http://localhost:9000/' + specRunner;

phantom.create(function (ph) {
  ph.createPage(function (page) {
    page.open(url, function (status) {
      page.evaluate(function () { 
        return {
          'passes': document.querySelector('#mocha-stats .passes').innerText,
          'failures': document.querySelector('#mocha-stats .failures').innerText,
          'duration': document.querySelector('#mocha-stats .duration').innerText
        };
      }, function(result) {
        console.log(result.passes);
        console.log(result.failures);
        console.log(result.duration);

        ph.exit();
        process.kill();
      });
    });
  });
});