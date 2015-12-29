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

    const handle = new NextTickWrap();
    const uid = --state.counter;

    // call the init hook
    hooks.init.call(handle, 0, uid, null);

    // overwrite callback
    args[0] = function () {
      // call the pre hook
      hooks.pre.call(handle);

      callback.apply(this, arguments);

      // call the post hook, followed by the destroy hook
      hooks.post.call(handle);
      hooks.destroy.call(null, uid);
    };

    return oldNextTick.apply(process, args);
  };
}
