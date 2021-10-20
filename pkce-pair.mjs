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

const randomIndicesCreate = (crypto, size) => {
  crypto = cryptoResolve(crypto);

  return crypto.getRandomValues
    ? crypto.getRandomValues(new Uint8Array(size))
    : crypto.randomBytes(size);
};

const mask =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~';

const createVerifier = (crypto, len, result = '') => {
  const randomIndices = randomIndicesCreate(crypto, len);
  const byteLength = Math.pow(2, 8); // 256
  const maskLength = Math.min(mask.length, byteLength);
  // the scaling factor breaks down the possible values of bytes (0x00-0xFF)
  // into the range of mask indices
  const scalingFactor = byteLength / maskLength;
  while (len--)
    result += mask[Math.floor(randomIndices[len] / scalingFactor)];

  return result;
};

const createSHA256Digest = (crypto, str) => new Uint8Array(crypto.subtle.digest(
  'SHA-256', new Uint8Array(str.length).map((_, i) => str.charCodeAt(i))));

const createAStrFromDigest = dig => btoa(String.fromCharCode.apply(0, dig));

const createChallenge = async (crypto, verifier) => {
  crypto = cryptoResolve(crypto);

  return ( // https://tools.ietf.org/html/rfc4648#section-5
    crypto.createHash
      ? crypto.createHash('sha256').update(verifier).digest('base64')
      : createAStrFromDigest(createSHA256Digest(crypto, verifier))
  ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const isVerified = async (crypto, verifier, challenge) => (
  await createChallenge(crypto, verifier, crypto)) === challenge;

const create = async (crypto, len = 43) => {
  if (len < 43 || len > 128)
    throw new Error(`Expected a length between 43 and 128. Received ${len}.`);

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
