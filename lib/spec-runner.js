var fs = require('fs');

var SpecRunner = {
  filename: 'SpecRunner.html',

  create: function(spec, scripts) {
    fs.createReadStream('template/' + this.filename).pipe(fs.createWriteStream(this.filename));

    fs.readFile(this.filename, 'utf-8', function(err, data) {
      var code = data.replace('{{ SPEC }}', spec);
      code = code.replace('{{ SCRIPTS }}', scripts.join(''));

      fs.writeFile(this.filename, code);
    }.bind(this));
  }
};

module.exports = SpecRunner;