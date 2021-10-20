
const cryptoResolve = crypto => {  
  const cryptoResolved = crypto
        || (typeof window === 'object' && window.crypto);
  const cryptoIsSupported = cryptoResolved && (
    typeof cryptoResolved.getRandomValues === 'function'
      || typeof cryptoResolved.randomBytes === 'function');

  if (!cryptoIsSupported)
    throw new Error('supported crypto module not found');

  return cryptoResolved;
};

// https://tools.ietf.org/html/rfc4648#section-5
const b64Uri = str => str
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const b64UriFromBinary = str => b64Uri(btoa(str));

const randomIndicesCreate = (crypto, size) => {
  crypto = cryptoResolve(crypto);

  return crypto.getRandomValues
    ? crypto.getRandomValues(new Uint8Array(size)) // browser crypto
    : crypto.randomBytes(size); // node crypto
};

const random = (crypto, size, mask, result = '') => {
  const randomIndices = randomIndicesCreate(crypto, size);
  const byteLength = Math.pow(2, 8); // 256
  const maskLength = Math.min(mask.length, byteLength);
  // the scaling factor breaks down the possible values of bytes (0x00-0xFF)
  // into the range of mask indices
  const scalingFactor = byteLength / maskLength;
  while (size--) {
    result += mask[Math.floor(randomIndices[size] / scalingFactor)];
  }

  return result;
};

// eslint-disable-next-line max-len
const charMask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~';

const createVerifier = (crypto, len) => random(crypto, len, charMask);

const createChallenge = async (crypto, verifier) => {
  crypto = cryptoResolve(crypto);

  if (crypto.createHash)
    return b64Uri(
      crypto.createHash('sha256').update(verifier).digest('base64'));

  const digest = await crypto.subtle.digest(
    'SHA-256', new Uint8Array(verifier.length)
      .map((num, i) => verifier.charCodeAt(i)));

  return b64UriFromBinary(
    String.fromCharCode.apply(null, (new Uint8Array(digest)))); 
};

const isVerified = async (crypto, verifier, challenge) => (
  await createChallenge(crypto, verifier, crypto)) === challenge;

const create = async (crypto, len = 43) => {
  if (len < 43 || len > 128) {
    throw new Error(`Expected a length between 43 and 128. Received ${len}.`);
  }

  const verifier = createVerifier(crypto, len);

  return {
    verifier,
    challenge : await createChallenge(crypto, verifier)
  };
};

export default Object.assign(create, {
  createVerifier,
  createChallenge,
  isVerified
});

export {
  create,
  createVerifier,
  createChallenge,
  isVerified
};
