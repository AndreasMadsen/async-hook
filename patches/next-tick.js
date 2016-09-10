'use strict';

function NextTickWrap() {}

module.exports = function patch() {
  const hooks = this._hooks;
  const state = this._state;

  const oldNextTick = process.nextTick;
  process.nextTick = function () {
    if (!state.enabled) return oldNextTick.apply(process, arguments);

    const args = Array.from(arguments);
    const callback = args[0];

    if (typeof callback !== 'function') {
      throw new TypeError('callback is not a function');
    }

    const handle = new NextTickWrap();
    const uid = --state.counter;

    // call the init hook
    hooks.init.call(handle, uid, 0, null, null);

    // overwrite callback
    args[0] = function () {
      // call the pre hook
      hooks.pre.call(handle, uid);

      let didThrow = true;
      try {
        callback.apply(this, arguments);
        didThrow = false;
      } finally {
        if(didThrow) {
          // Callback throws and there is at least one listener for `uncaughtException` event, so that process won't quit abrutly.
          if(process.listenerCount('uncaughtException') > 0) {
            process.once('uncaughtException', function () {
              hooks.post.call(handle, uid, true);
              hooks.destroy.call(null, uid);
            });
          }
          // or, the process exits with non-zero status code and both `post` and `destroy` hooks won't be called.
        } else {
          // callback done successfully
          hooks.post.call(handle, uid, false);
          hooks.destroy.call(null, uid);
        }
      }
    };

    return oldNextTick.apply(process, args);
  };
}
