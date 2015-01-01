#! /usr/bin/env node

'use strict';

var fs = require('fs');
var phantom = require('phantom');
var server = require('./lib/server.js');
var colors = require('colors');

var params = process.argv.slice(2);
var tpScript = '<script src="{{ VALUE }}"></script>';
var spec = tpScript.replace('{{ VALUE }}', params[0]);
var scripts = params.slice(1).map(function(value) {
  return tpScript.replace('{{ VALUE }}', value);
});

var specRunner = 'SpecRunner.html';
fs.createReadStream('tmp/' + specRunner).pipe(fs.createWriteStream(specRunner));

fs.readFile(specRunner, 'utf-8', function(err, data) {
  var code = data.replace('{{ SPEC }}', spec);
  code = code.replace('{{ SCRIPTS }}', scripts.join(''));

  fs.writeFile(specRunner, code);
});

server(9000);

var url = 'http://localhost:9000/' + specRunner;

phantom.create(function (ph) {
  ph.createPage(function (page) {
    page.open(url, function (status) {
      page.evaluate(function () {
        var $ = function(value) {
          return document.querySelector(value);
        };

        var getResult = function() {
          var list = document.querySelectorAll('#mocha-report ul > li');

          return [].map.call(list, function(element) {
            return element.classList.contains('pass') ? '✓ ' + element.innerText :
                   '✖ ' + element.innerText;
          });
        };

        return {
          'specName': $('#mocha-report h1').innerText.green,
          'result': getResult(),
          'passes': $('#mocha-stats .passes').innerText,
          'failures': $('#mocha-stats .failures').innerText,
          'duration': $('#mocha-stats .duration').innerText
        };
      }, function(result) {
        console.log(result.specName);
        
        result.result.map(function(element) {
          console.log(element);
        });

        console.log(' ' + result.passes);
        console.log(' ' + result.failures);
        console.log(' ' + result.duration);

        ph.exit();
        process.kill();
      });
    });
  });
});