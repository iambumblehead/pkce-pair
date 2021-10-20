const cryptoResolve = crypto => {
  const cryptoResolved = crypto || ( typeof window === 'object' && window.crypto );
  const cryptoIsSupported = cryptoResolved && (
    typeof cryptoResolved.getRandomValues === 'function'
      || typeof cryptoResolved.randomBytes === 'function' );

  if ( !cryptoIsSupported )
    throw new Error( 'supported crypto module not found' );

  return cryptoResolved;
};

// https://tools.ietf.org/html/rfc4648#section-5
const b64Uri = str => str
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const b64UriFromBinary = str => b64Uri(btoa(str));

const randomIndicesCreate = ( size, crypto ) => {
  crypto = cryptoResolve( crypto );

  return crypto.getRandomValues
    ? crypto.getRandomValues(new Uint8Array(size)) // browser crypto
    : crypto.randomBytes(size); // node crypto
};

const random = (size, crypto, mask) => {
  let result = '';
  const randomIndices = randomIndicesCreate( size, crypto );
  const byteLength = Math.pow(2, 8); // 256
  const maskLength = Math.min(mask.length, byteLength);
  // the scaling factor breaks down the possible values of bytes (0x00-0xFF)
  // into the range of mask indices
  const scalingFactor = byteLength / maskLength;
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(randomIndices[i] / scalingFactor);
    result += mask[randomIndex];
  }
  return result;
};

const createVerifier = ( len, crypto ) => random(
  len, crypto, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~' );

const createChallenge = async ( verifier, crypto ) => {
  crypto = cryptoResolve( crypto );

  if ( crypto.createHash )
    return b64Uri( crypto.createHash( 'sha256' ).update( verifier ).digest( 'base64' ) );
    
  const digest = await crypto.subtle.digest(
    'SHA-256', new Uint8Array(verifier.length).map((num, i) => verifier.charCodeAt(i) ));

  return b64UriFromBinary( String.fromCharCode.apply(null, (new Uint8Array(digest))) ); 
};

const isVerified = async (verifier, challenge, crypto) => (
  ( await createChallenge(verifier, crypto) ) === challenge );

const pkcePairCreate = async (len = 43, crypto) => {
  if ( len < 43 || len > 128) {
    throw new Error( `Expected a length between 43 and 128. Received ${len}.` );
  }

  const verifier = createVerifier(len, crypto);

  return {
    code_verifier: verifier,
    code_challenge: await createChallenge(verifier, crypto)
  };
};

module.exports = Object.assign( pkcePairCreate, {
  createVerifier,
  createChallenge,
  isVerified
});

 {
  pkcePairCreate,
  createVerifier,
  createChallenge,
  isVerified
};
