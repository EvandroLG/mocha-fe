var phantom = require('phantom');

var executePhantom = function(url) {
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
};

var Browser = {
  run: function(url) {
    executePhantom(url);
  }
};

module.exports = Browser;