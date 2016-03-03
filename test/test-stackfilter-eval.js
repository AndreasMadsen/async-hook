'use strict';

require('../');

let e;
eval('(function() { e = new Error(); })()');

e.stack;
