'use strict';

const assert = require('assert');
const asyncHook = require('../');

asyncHook.enable();

process.nextTick(function () {
  throw new Error('boom');
});

process.once('exit', function (statusCode) {
  assert.equal(statusCode, 1);
});
