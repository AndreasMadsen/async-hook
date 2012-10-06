/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var Module = require('module');
var events = require('events');

// Try loading the method list, there is compiled from the JSON formated
// documentation.
var api;
try {
  api = require('./api.json');
} catch (e) {
  throw new Error('async-hook was not installed correctly');
}

// Exposed monkey patch API
function Interceptor() {
  this.handlers = [];
}

// internal method, takes a path (UUID) and a arguments object
// - it returns a modified arguments object
Interceptor.prototype._intercept = function (path, args) {
  // find callback index
  var i = args.length;
  while (i--) if (typeof args[i] === 'function') break;

  // get new callback
  var handlers = this.handlers.slice(0);
  var cb = args[i];
  var l = handlers.length;
  for (var n = 0; n < l; n++) {
    var next = handlers[n](path, cb);
    if (typeof next === 'function') {
      cb = next;
      next = undefined;
    }
  }

  // overwrite the callback
  args[i] = cb;
  return args;
};

// Attach a interception handler
Interceptor.prototype.attach = function (callback) {
  this.handlers.push(callback);
};

// Deattach a interception handler
Interceptor.prototype.deattach = function (callback) {
  var index = this.handlers.indexOf(callback);
  if (index === -1) return;

  this.handlers.splice(index, 1);
};

// create exposed interceptors
var callbackHook = exports.callback = new Interceptor();
var eventHook = exports.event = new Interceptor();

// To prevent a lot of noice, we will lazy monkey patch native modules as they
// get required.
(function () {
  var require = Module.prototype.require;
  Module.prototype.require = function (path) {
    monkeyPatchModule(path);
    return require.apply(this, arguments);
  };
})();

// This function will monkey patch any module
var nativemodules = Object.keys(api),
    patched = ['events'];

function monkeyPatchModule(name) {
  // Ignore none native modules, we don't have any API documentation
  if (nativemodules.indexOf(name) === -1) return;

  // Don't monkeypatch modules twice
  if (patched.indexOf(name) !== -1) return;
  patched.push(name);

  // load module object
  var root = require(name),
      moduleAPI = api[name];

  // mokeypatch methods
  monkeyPatchMethods(name, root, moduleAPI.methods);

  // monkeypatch classes
  moduleAPI.classes.forEach(function (classAPI) {
    var className = classAPI.name;
    var classObj = root[className];
    if (!classObj) return;

    monkeyPatchMethods(name + '.' + className, classObj.prototype, classAPI.methods);
  });
}

// Will monkeypatch a list of methods
function monkeyPatchMethods(prefix, root, methods) {
  methods.forEach(function (methodAPI) {

    // Skip methods there don't take callbacks
    if (methodAPI.params.indexOf('callback') === -1) return;

    // monkeypatch method
    monkeyPatchMethod(prefix, root, methodAPI.name);
  });
}

// Will monkeypatch a method - it is impossibol to monkey patch a function :)
function monkeyPatchMethod(prefix, root, name) {
  // create method path (UUID)
  var path = prefix + '.' + name;

  var original = root[name];
  root[name] = function () {
    var args = callbackHook._intercept(path, arguments);
    return original.apply(this, args);
  };
}

// Will monkeypatch EventEmitter
(function () {
  var root = events.EventEmitter.prototype;

  // monkeypatch EventEmitter.once
  var once = root.once;
  root.once = function () {
    var origin = arguments[1];
    var args = eventHook._intercept('events.EventEmitter.once', arguments);

    // .listener is a little nodejs secret, there makes removeListener work
    // when monkey-patching an event handler.
    args[1].listener = origin;

    return once.apply(this, args);
  };

  // monkeypatch EventEmitter.on and EventEmitter.addListener
  var on = root.on;
  root.on = root.addListener = function () {
    var origin = arguments[1];

    // if .on was called from .once
    if (typeof origin.listener === 'function') {

      // restore the input function attachment
      if (typeof origin.listener.listener === 'function') {

        // origin will be a node internal g() function
        // origin.lisenter will be attach(input);
        // origin.lisenter.lisenter will be input;
        // where input is event.once('name', input);
        arguments[1].listener = origin.listener.listener;
      }

      return on.apply(this, arguments);
    }

    var args = eventHook._intercept('events.EventEmitter.on', arguments);

    // .listener is a little nodejs secret, there makes removeListener work
    // when monkey-patching an event handler.
    args[1].listener = origin;

    return on.apply(this, args);
  };
})();

// Already required modules, will be monkey patched now.
var prefix = 'NativeModule ';

process.moduleLoadList
  .filter(function (name) {
    return (name.indexOf(prefix) === 0);
  }).map(function (name) {
    return name.slice(prefix.length);
  }).forEach(monkeyPatchModule);

// monkeypatch process.nextTick, since it isn't a module
monkeyPatchMethod('process', process, 'nextTick');

// monkeypatch timer methods ('setTimeout', ...), since those are often
// required by NativeModule.require and that can't be intercepted
monkeyPatchModule('timers');
