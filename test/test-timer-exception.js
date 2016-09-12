'use strict';

const asyncHook = require('../');

asyncHook.enable();

setTimeout(function () {
  throw new Error('boom');
});
