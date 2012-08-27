#async-hook

> Allow hooking intro async functions, primarily for debugging purpose.

## Installation

```sheel
npm install async-hook
```

##API documentation

```JavaScript
  var hook = require('async-hook');
```

### hook.callback.attach(callback)

`callback` is called with the following arguments:

* `name`: the name of the function there was executed `{module}.{method}`
* `fn`: the callback function there was applied to the function

If `callback` returned a `function` that function will be used insted of `fn`.
This allow you to hook intro any callback.

Example:

```JavaScript
  hook.callback.attach(function (name, fn) {
    var time = Date.now();
    return function () {
      console.log('used ' + (Date.now() - time) + ' ms on ' + name);
      fn.apply(this, arguments);
    };
  });
```

### hook.callback.deattach(callback)

Remove an attached callback.

### hook.event.attach(callback)

`callback` is called with the following arguments:

* `name`: the name of the event there was added {eventname}
* `fn`: the event handler there was applied to the event emitter

### hook.event.deattach(callback)

Remove an attached callback.

##License

**The software is license under "MIT"**

> Copyright (c) 2012 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
