import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import {decodeSecretKeySeed} from 'bnid';

export const getMultikey = async ({seedMultibase}) => {
  if(!seedMultibase) {
    throw new Error('seedMultibase required');
  }
  // convert multibase seed to Uint8Array
  const seed = decodeSecretKeySeed({secretKeySeed: seedMultibase});
  const key = await Ed25519Multikey.generate({seed});
  const signer = key.signer();
  // issuer need to match the signer or the controller of the signer
  const issuer = `did:key:${key.publicKeyMultibase}`;
  // verificationMethod needs to be a fragment
  signer.id = `${issuer}#${key.publicKeyMultibase}`;
  return {signer, issuer};
};

/**
 * Concatenates two Uint8Arrays.
 *
 * @param {Uint8Array} b1 - A UInt8Array.
 * @param {Uint8Array} b2 - A Uint8Array.
 *
 * @returns {Uint8Array} The result.
 */
export const concatTypeArrays = (b1, b2) => {
  const rval = new Uint8Array(b1.length + b2.length);
  rval.set(b1, 0);
  rval.set(b2, b1.length);
  return rval;
};
