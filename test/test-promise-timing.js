'use strict';

const asyncHook = require('../');
const assert = require('assert');

const eventOrder = [];

asyncHook.addHooks({
  init: function (uid) {
    eventOrder.push(`init#${uid}`);
  },
  pre: function (uid) {
    eventOrder.push(`pre#${uid}`);
  },
  post: function (uid) {
    eventOrder.push(`post#${uid}`);
  },
  destroy: function (uid) {
    eventOrder.push(`destroy#${uid}`);
  }
});

asyncHook.enable();

new Promise(function (s) {
  setTimeout(s, 100); // 1
})
.then(function () {
  return new Promise((s) => setTimeout(s, 100)); // 2
})
.then();

process.once('exit', function () {
  assert.deepEqual(eventOrder, [
    'init#-1',
    'init#-2',
    'init#-3',
    'pre#-1',
    'post#-1',
    'destroy#-1',
    'pre#-2',
    'init#-4',
    'post#-2',
    'destroy#-2',
    'pre#-4',
    'post#-4',
    'destroy#-4',
    'destroy#-3'
  ]);
});
