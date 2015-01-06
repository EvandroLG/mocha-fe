#! /usr/bin/env node

'use strict';

var phantom = require('phantom');
var colors = require('colors');
var server = require('./lib/server.js');
var SpecRunner =require('./lib/spec-runner.js');


var params = process.argv.slice(2);
var script = '<script src="{{ VALUE }}"></script>';
var spec = script.replace('{{ VALUE }}', params[0]);
var scripts = params.slice(1).map(function(value) {
  return script.replace('{{ VALUE }}', value);
});

SpecRunner.create(spec, scripts);
server(9000);

var url = 'http://localhost:9000/' + SpecRunner.filename;

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
            var text = element.classList.contains('pass') ? '✓ ' + element.innerText :
                   '✖ ' + element.innerText;

            return text.replace('‣', '').split('\n');
          });
        };

        return {
          'specName': $('#mocha-report h1').innerText,
          'result': getResult(),
          'passes': $('#mocha-stats .passes').innerText,
          'failures': $('#mocha-stats .failures').innerText,
          'duration': $('#mocha-stats .duration').innerText
        };
      }, function(result) {
        console.log(result.specName);
        result.result.map(function(element) {
          var text = '  ' + element[0];
          console.log(element.length);
          text.indexOf('✓') >= 0 ? console.log(text.green) : 
                                   console.log(text.red);
        });

        console.log('\n');
        console.log('  ' + result.passes.green);
        console.log('  ' + result.failures.red);
        console.log('  ' + result.duration);

        ph.exit();
        process.kill();
      });
    });
  });
});