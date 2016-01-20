'use strict';

const asyncHook = require('../');
const assert = require('assert');

let thenCalled1 = [false, false];
let thenCalled2 = [false, false];
let catchCalled1 = false;
let catchCalled2 = false;

let arg1 = null;
let arg2 = null;
let arg3 = null;

asyncHook.addHooks({
  init: function () {
    assert(false);
  },
  pre: function () {
    assert(false);
  },
  post: function () {
    assert(false);
  },
  destroy: function () {
    assert(false);
  }
});

asyncHook.enable();
asyncHook.disable();

Promise
	.resolve('a')
	.then(_arg => {
		arg1 = _arg;
		thenCalled1[0] = true;
	}, () => {
		thenCalled1[1] = true;
	});

Promise
	.reject('b')
	.then(() => {
		thenCalled2[0] = true;
	}, _arg => {
		arg2 = _arg
		thenCalled2[1] = true;
	});

Promise
	.reject('c')
	.catch(_arg => {
		arg3 = _arg;
		catchCalled1 = true;
	});

Promise
	.resolve('d')
	.catch(() => {
		catchCalled2 = true;
	});

process.once('exit', function () {
	assert.deepStrictEqual(thenCalled1, [true, false]);
	assert.equal(arg1, 'a');
	assert.deepStrictEqual(thenCalled2, [false, true]);
	assert.equal(arg2, 'b');
	assert.equal(catchCalled1, true);
	assert.equal(arg3, 'c');
	assert.equal(catchCalled2, false);
});
