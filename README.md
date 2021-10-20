pkce-pair
=========
**(c)[Bumblehead][0]**

[![npm version](https://badge.fury.io/js/pkce-pair.svg)](https://badge.fury.io/js/pkce-pair) [![Build Status](https://github.com/iambumblehead/pkce-pair/workflows/nodejs-ci/badge.svg)][2]

Creates and validates [PKCE-pairs][12] for node and browser environments. `pkce-pair` copies from projects [here][10] and [here.][11] PKCE-pair brings together a few different things missing from numerous other PKCE packages published on npm,
  * returns values from node and browser runtimes,
  * returns Promises rather than callbacks for using `window.crypto`


If you're only using PKCE pairs in a node server environment only, [the pkce-challenge package][11] is a little bit smaller than this one and it doesn't need to return Promises, which are returned here because browser `window.crypto` returns them.


[10]: https://github.com/coolgk/utils/
[11]: https://github.com/crouchcd/pkce-challenge
[12]: https://datatracker.ietf.org/doc/html/rfc7636#section-4.1



```javascript
import pkcePair, {
  create,
  createVerifier,
  createChallenge,
  isVerified
} from 'pkce-pair';
```

call imported functions with a node or browser `crypto` object,
```javascript
import pkcePair from 'pkce-pair';
import crypto from 'crypto';

const pair = await pkcePair(crypto);
const isVerified = await isVerified(crypto, pair.verifier, pair.challenge);

console.log(isVerified); // true
```

another example, using browser `window.crypto`
```javascript
import pkcePair from 'pkce-pair';

const pair = await pkcePair(window.crypto);
const challenge = await pkcePair.createChallenge(window.crypto, pair.verifier);
const isVerified = await isVerified(window.crypto, pair.verifier, challenge);

console.log(isVerified); // true
```



![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand.png)

(The MIT License)

Copyright (c) [Bumblehead][0] <chris@bumblehead.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[2]: https://github.com/iambumblehead/pkce-pair "pkce-pair"
