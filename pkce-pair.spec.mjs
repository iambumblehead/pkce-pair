import test from 'ava';
import crypto from 'crypto';
import webcrypto from '@peculiar/webcrypto';

import pkcePairCreate, {
  createVerifier,
  createChallenge,
  isVerified
} from './pkce-pair.mjs';

const wincrypto = Object.assign(new webcrypto.Crypto(), {
  subtle : {
    digest : (alg, arr) => alg === 'SHA-256' &&
      crypto.createHash('sha256').update(arr).digest()
  }
});

const anyCrypto = () => Math.random() < 0.5 ? crypto : wincrypto;

test('code_verifier users default length 43', async t => {  
  const pkcePair = await pkcePairCreate(anyCrypto());

  t.is(pkcePair.verifier.length, 43);
});

test('verifier pattern matches', async t => {
  const pattern = /^[A-Za-z\d\-._~]{43,128}$/;
  const pkcePair = await pkcePairCreate(anyCrypto(), 128);

  t.regex(pkcePair.verifier, pattern);
});

test('challenge pattern does not have [=+/]', async t => {
  const pkcePair = await pkcePairCreate(anyCrypto(), 128);

  t.notRegex(pkcePair.challenge, /[\/+=]/);
});

test('verifier length < 43 throws error', async t => {
  await t.throwsAsync(() => pkcePairCreate(anyCrypto(), 42), {
    message : 'Expected a length between 43 and 128. Received 42.'
  });
});

test('verifier length > 128 throws error', async t => {
  await t.throwsAsync(() => pkcePairCreate(anyCrypto(), 129), {
    message : 'Expected a length between 43 and 128. Received 129.'
  });
});

test('isVerified should return true', async t => {
  const pkcePair = await pkcePairCreate(anyCrypto(), 43);
  const verified = await isVerified(
    anyCrypto(), pkcePair.verifier, pkcePair.challenge);

  t.true(verified);
});

test('isVerified should return false', async t => {
  const pkcePair = await pkcePairCreate(anyCrypto(), 43);
  const verified = await isVerified(
    anyCrypto(), pkcePair.verifier, pkcePair.challenge + 'a');

  t.false(verified);
});

test('createChallenge should create a consistent challenge', async t => {
  const pkcePair = await pkcePairCreate(anyCrypto(), 43);
  const challenge = await createChallenge(anyCrypto(), pkcePair.verifier);
  
  t.is(pkcePair.challenge, challenge);
});

test('web-generated pair should be verified by node module', async t => {
  const pkcePair = await pkcePairCreate(wincrypto, 43);
  const verified = await isVerified(
    crypto, pkcePair.verifier, pkcePair.challenge);

  t.true(verified);
});

test('node-generated pair should be verified by web module', async t => {
  const pkcePair = await pkcePairCreate(crypto, 43);
  const verified = await isVerified(
    wincrypto, pkcePair.verifier, pkcePair.challenge);

  t.true(verified);
});
