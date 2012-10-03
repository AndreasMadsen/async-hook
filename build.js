
var flower = require('flower');
var http = require('http');
var fs = require('fs');

// get node version
var version = process.version,
    index = version.indexOf('-pre');

if (index !== -1) {
  version = version.slice(0, index).split('.');
  version[2] = parseInt(version[2], 10) - 1;
  version = version.join('.');
}

// get json documentation
var href = 'http://nodejs.org/dist/' + version + '/docs/api/all.json';
http.get(href, function (res) {
  flower.stream2buffer(res, function (err, buffer) {
    if (err) throw err;

    var object = JSON.parse(buffer.toString());
    var modules = {};

    object.modules
      .filter(function (obj) {
        return obj.hasOwnProperty('stability');
      })
      .forEach(function (obj) {
        var parse = parseModule(obj);
        var name = parse.name;
        delete parse.name;

        modules[name] = parse;
      });

    fs.writeFile('./api.json', JSON.stringify(modules), function (err) {
      if (err) throw err;
    });
  });
});

function parseModule(module) {
  return {
    name: (module.name === 'tls_(ssl)' ? 'tls' : module.name).toLowerCase(),
    methods: parseMethods(module.methods),
    classes: parseClasses(module.classes)
  };
}

function parseMethods(methods) {
  if (!methods) return [];

  var listed = [];
  var output = [];

  methods.forEach(function (obj) {
    var name = obj.name;
    var index = listed.indexOf(name);

    // Add method items if it don't exist
    if (index === -1) {
      listed.push(name);
      output.push({
        name: name,
        params: []
      });
      index = listed.length - 1;
    }

    // concat sinatures
    output[index].params.push.apply(output[index].params, obj.signatures);
  });

  output.forEach(function (obj) {
    obj.params = parseSignature(obj.params);
  });

  return output;
}

// classes contains name and sub methods
// methods will be parsed like root methods
function parseClasses(classes) {
  if (!classes) return [];

  var output = [];

  classes.forEach(function (obj) {
    output.push({
      name: obj.name.split('.').pop(),
      methods: parseMethods(obj.methods)
    });
  });

  return output;
}

// parse concated signature array
function parseSignature(signatures) {
  var params = [];

  // go though each signature collection
  signatures.forEach(function (signature) {
    if (!signature.params) return;

    // go though signature params
    signature.params.forEach(function (param) {
      var name = param.name;
      if (name === '...') return;

      // prevent dublicated signatures
      if (params.indexOf(name) === -1) {
        params.push(name);
      }
    });
  });

  return params;
}
