'use strict';

function PromiseWrap() {};

module.exports = function patchPromise() {
	const hooks = this._hooks;
	const state = this._state;

	const Promise = global.Promise;
	const oldThen = Promise.prototype.then;
	Promise.prototype.then = wrappedThen;

	function makeWrappedHandler(fn, handle, uid) {
		if ('function' !== typeof fn) return fn;

		return function wrappedHandler() {
			hooks.pre.call(handle);
			try {
				return fn.apply(this, arguments);
			} finally {
				hooks.post.call(handle);
				hooks.destroy.call(null, uid);
			}
		};
	}

	function wrappedThen(onFulfilled, onRejected) {
		if (!state.enabled) return oldThen.call(this, onFulfilled, onRejected);

		const handle = new PromiseWrap();
		const uid = --state.counter;

		hooks.init.call(handle, 0, uid, null);

		return oldThen.call(
			this,
			makeWrappedHandler(onFulfilled, handle, uid),
			makeWrappedHandler(onRejected, handle, uid)
		);
	}
};
