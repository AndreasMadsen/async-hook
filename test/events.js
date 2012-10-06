
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

  t.test("this keyword in event handler", function (t) {
    t.plan(4);

    var e = new EventEmitter();
    var callOrder = 0;

    function eventHandler() {
      t.equal(this, e, 'this keyword match');
      t.equal(callOrder++, 1, 'real callback was executed after patch callback');
      t.end();
    }

    // attach monkey patch callback
    hook.event.attach(function eventAttach(name, callback) {
      hook.event.deattach(eventAttach);

      return function () {
        t.equal(this, e, 'this keyword match');
        t.equal(callOrder++, 0, 'pached callback is executed first');

        // chain the callback
        return callback.apply(this, arguments);
      };
    });

    e.on('test', eventHandler);
    e.emit('test');
  });

  t.test('emitter.addListener and emitter.on are the same', function (t) {
    var e = new EventEmitter();

    t.equal(e.on, e.addListener, 'emitter.addListener and emitter.on is equal');
    t.end();
  });

  t.test('e.once self removeing', function (t) {

    // attach a simple patcher
    function eventAttach(name, callback) {
      return function () {
        callback.apply(this, arguments);
      };
    }
    hook.event.attach(eventAttach);

    // expected to be executed
    function boo() {
      t.end();
    }

    // create EventEmitter objecct
    var e = new EventEmitter();

    // check that the final newListener is equal to boo
    e.once('newListener', function (name, fn) {
        t.equal(fn, boo);
    });

    // add boo event handler
    e.once('boo', boo, 'input fn was boo()');

    // expect boo to execute
    e.emit('boo');

    // do not expect boo to execute
    e.emit('boo');

    // cleanup
    hook.event.deattach(eventAttach);
  });

  t.test('e.once manual remove', function (t) {

    // attach a simple patcher
    function eventAttach(name, callback) {
      return function () {
        callback.apply(this, arguments);
      };
    }
    hook.event.attach(eventAttach);

    // do not expect this to execute
    function boo() {
      t.end();
    }

    // create EventEmitter object
    var e = new EventEmitter();

    // check that the final newLisenter is equal to boo
    e.once('newListener', function (name, fn) {
        t.equal(fn, boo, 'input fn was boo()');
    });

    // do not expect boo to execute
    e.once('boo', boo);
    e.removeListener('boo', boo);
    e.emit('boo');

    // cleanup
    hook.event.deattach(eventAttach);

    // done
    t.end();
  });

  t.test('e.on manual remove', function (t) {

    // attach a simple patcher
    function eventAttach(name, callback) {
      return function () {
        callback.apply(this, arguments);
      };
    }
    hook.event.attach(eventAttach);

    // do not expect this to execute
    function boo() {
      t.end();
    }

    // create EventEmitter object
    var e = new EventEmitter();

    // check that the final newLisenter is equal to boo
    e.once('newListener', function (name, fn) {
        t.equal(fn, boo, 'input fn was boo()');
    });

    // do not expect boo to execute
    e.on('boo', boo);
    e.removeListener('boo', boo);
    e.emit('boo');

    // cleanup
    hook.event.deattach(eventAttach);

    // done
    t.end();
  });

});
