'use strict';

const asyncHook = require('../');

asyncHook.enable();

process.nextTick(function () {
  throw new Error('test error');
});
