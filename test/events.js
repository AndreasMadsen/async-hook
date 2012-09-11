
var fs = require('fs');
var path = require('path');
var test = require('tap').test;
var EventEmitter = require('events').EventEmitter;

// get the module root directory
var root = path.resolve(path.dirname(module.filename), '..');

// throw if module isn't build
var isBuild = fs.existsSync(path.resolve(root, 'api.json'));
if (isBuild === false) {
  throw new Error('async-hook not build');
}

// require async-hook module
var hook = require('../hook.js');

test("events hook", function (t) {


  t.test("attach event emit by .addListener", function (t) {
    t.plan(6);

    var e = new EventEmitter();
    var callOrder = 0;
    var obj = {};
    var uuid = 'events.EventEmitter.on';


    function eventHandler(param) {
      t.equal(param, obj, 'arguments has been relayed');
      t.equal(callOrder++, 1, 'real callback was executed after patch callback');
      t.end();
    }

    // attach monkey patch callback
    hook.event.attach(function eventAttach(name, callback) {
      hook.event.deattach(eventAttach);

      t.equal(name, uuid, 'name argument in .attach is ' + uuid);
      t.equal(callback, eventHandler, 'callback argument match input');

      return function (param) {
        t.equal(param, obj, 'arguments has been relayed');
        t.equal(callOrder++, 0, 'pached callback is executed first');

        // chain the callback
        return callback.apply(this, arguments);
      };
    });

    e.addListener('test', eventHandler);
    e.emit('test', obj);
  });

  t.test("attach event emit by .on", function (t) {
    t.plan(6);

    var e = new EventEmitter();
    var callOrder = 0;
    var obj = {};
    var uuid = 'events.EventEmitter.on';

    function eventHandler(param) {
      t.equal(param, obj, 'arguments has been relayed');
      t.equal(callOrder++, 1, 'real callback was executed after patch callback');
      t.end();
    }

    // attach monkey patch callback
    hook.event.attach(function eventAttach(name, callback) {
      hook.event.deattach(eventAttach);

      t.equal(name, uuid, 'name argument in .attach is ' + uuid);
      t.equal(callback, eventHandler, 'callback argument match input');

      return function (param) {
        t.equal(param, obj, 'arguments has been relayed');
        t.equal(callOrder++, 0, 'pached callback is executed first');

        // chain the callback
        return callback.apply(this, arguments);
      };
    });

    e.on('test', eventHandler);
    e.emit('test', obj);
  });

  t.test("attach event emit by .once", function (t) {
    t.plan(6);

    var e = new EventEmitter();
    var callOrder = 0;
    var obj = {};
    var uuid = 'events.EventEmitter.once';

    function eventHandler(param) {
      t.equal(param, obj, 'arguments has been relayed');
      t.equal(callOrder++, 1, 'real callback was executed after patch callback');
      t.end();
    }

    // attach monkey patch callback
    hook.event.attach(function eventAttach(name, callback) {
      hook.event.deattach(eventAttach);

      t.equal(name, uuid, 'name argument in .attach is ' + uuid);
      t.equal(callback, eventHandler, 'callback argument match input');

      return function (param) {
        t.equal(param, obj, 'arguments has been relayed');
        t.equal(callOrder++, 0, 'pached callback is executed first');

        // chain the callback
        return callback.apply(this, arguments);
      };
    });

    e.once('test', eventHandler);
    e.emit('test', obj);
  });

  t.test('emitter.addListener and emitter.on are the same', function (t) {
    var e = new EventEmitter();

    t.equal(e.on, e.addListener, 'emitter.addListener and emitter.on is equal');
    t.end();
  });

});
