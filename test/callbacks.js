
var fs = require('fs');
var path = require('path');
var test = require('tap').test;

// get the module root directory
var root = path.resolve(path.dirname(module.filename), '..');

// throw if module isn't build
var isBuild = fs.existsSync(path.resolve(root, 'api.json'));
if (isBuild === false) {
  throw new Error('async-hook not build');
}

// require async-hook module
var hook = require('../hook.js');

test("callback hook", function (t) {

  t.test("attach callback on module method", function (t) {
    t.plan(8);

    var callOrder = 0;

    // argument passed public to fs.open
    function openCallback(err, fd) {
      t.equal(err, null, 'no error passed to real callback');
      t.type(fd, 'number', 'fs argument passed real callback to is a number');
      t.equal(callOrder++, 1, 'real callback was executed after patch callback');

      // close the fd
      fs.close(fd, t.end.bind(t));
    }

    // attach monkey patch callback
    hook.callback.attach(function callbackAttach(name, callback) {
      hook.callback.deattach(callbackAttach);

      t.equal(name, 'fs.open', 'name argument in .attach is fs.open');
      t.equal(callback, openCallback, 'callback argument match input');

      // set a new callback
      return function (err, fd) {
        t.equal(err, null, 'no error passed to patch callback');
        t.type(fd, 'number', 'fd argument passed to patch callback is a number');
        t.equal(callOrder++, 0, 'pached callback is executed first');

        // chain the callback
        return callback.apply(this, arguments);
      };
    });

    // execute fs.open
    fs.open(module.filename, 'r', openCallback);
  });

  t.test("attach chain of patches", function (t) {
    t.plan(3);

    var callOrder = 0;

    // argument passed public to fs.open
    function openCallback(err, fd) {
      t.equal(callOrder++, 2, 'real callback was executed as the last');

      // close the fd
      fs.close(fd, t.end.bind(t));
    }

    // attach monkey patch callback
    hook.callback.attach(function callbackAttach(name, callback) {
      hook.callback.deattach(callbackAttach);

      // set a new callback
      return function (err, fd) {
        t.equal(callOrder++, 1, 'pached callback in correct order');

        // chain the callback
        return callback.apply(this, arguments);
      };
    });

    // attach monkey patch callback
    hook.callback.attach(function callbackAttach(name, callback) {
      hook.callback.deattach(callbackAttach);

      // set a new callback
      return function (err, fd) {
        t.equal(callOrder++, 0, 'pached callback in correct order');

        // chain the callback
        return callback.apply(this, arguments);
      };
    });

    // execute fs.open
    fs.open(module.filename, 'r', openCallback);
  });

  t.test("attach callback on class method", function (t) {
    t.plan(4);

    var callOrder = 0;
    var server = require('net').createServer();

    // argument passed public to listen
    function listenCallback() {
      t.equal(callOrder++, 1, 'real callback was executed after patch callback');
      console.log('hi');

      server.close(function () {
        console.log('close');
        t.end();
      });
    }

    // attach monkey patch callback
    hook.callback.attach(function callbackAttach(name, callback) {
      if (name !== 'net.Server.listen') return callback;

      hook.callback.deattach(callbackAttach);

      t.equal(name, 'net.Server.listen', 'name argument in .attach is net.Server.listen');
      t.equal(callback, listenCallback, 'callback argument match input');

      // set a new callback
      return function () {
        t.equal(callOrder++, 0, 'pached callback in correct order');

        // chain the callback
        return callback.apply(this, arguments);
      };
    });

    server.listen(0, listenCallback);
  });

  t.test("patch process.nextTick callback", function (t) {
    t.plan(4);

    var callOrder = 0;

    // argument passed public to nextTick
    function tickCallback() {
      t.equal(callOrder++, 1, 'real callback was executed after patch callback');
      t.end();
    }

    // attach monkey patch callback
    hook.callback.attach(function callbackAttach(name, callback) {
      hook.callback.deattach(callbackAttach);

      t.equal(name, 'process.nextTick', 'name argument in .attach is process.nextTick');
      t.equal(callback, tickCallback, 'callback argument match input');

      // set a new callback
      return function () {
        t.equal(callOrder++, 0, 'pached callback is executed first');

        // chain the callback
        return callback.apply(this, arguments);
      };
    });

    // execute fs.open
    process.nextTick(tickCallback);
  });

  t.test("patch setTimeout callback", function (t) {
    t.plan(4);

    var callOrder = 0;

    // argument passed public to setTimeout
    function timeoutCallback(err, fd) {
      t.equal(callOrder++, 1, 'real callback was executed after patch callback');
      t.end();
    }

    // attach monkey patch callback
    hook.callback.attach(function callbackAttach(name, callback) {
      hook.callback.deattach(callbackAttach);

      t.equal(name, 'timers.setTimeout', 'name argument in .attach is timers.setTimeout');
      t.equal(callback, timeoutCallback, 'callback argument match input');

      // set a new callback
      return function (err, fd) {
        t.equal(callOrder++, 0, 'pached callback is executed first');

        // chain the callback
        return callback.apply(this, arguments);
      };
    });

    // execute fs.open
    setTimeout(timeoutCallback, 1);
  });

  t.test("patch setInterval callback", function (t) {
    t.plan(4);

    var callOrder = 0;

    // argument passed public to setInterval
    function timeoutCallback(err, fd) {
      t.equal(callOrder++, 1, 'real callback was executed after patch callback');
      clearInterval(timer);
      t.end();
    }

    // attach monkey patch callback
    hook.callback.attach(function callbackAttach(name, callback) {
      hook.callback.deattach(callbackAttach);

      t.equal(name, 'timers.setInterval', 'name argument in .attach is timers.setInterval');
      t.equal(callback, timeoutCallback, 'callback argument match input');

      // set a new callback
      return function (err, fd) {
        t.equal(callOrder++, 0, 'pached callback is executed first');

        // chain the callback
        return callback.apply(this, arguments);
      };
    });

    // execute fs.open
    var timer = setInterval(timeoutCallback, 1);
  });

});
