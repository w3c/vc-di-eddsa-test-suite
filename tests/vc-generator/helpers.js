import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import crypto from 'crypto';
import {decodeSecretKeySeed} from 'bnid';

export const getMultikey = async ({seedMultibase}) => {
  if(!seedMultibase) {
    throw new Error('seedMultibase required');
  }
  // convert multibase seed to Uint8Array
  const seed = decodeSecretKeySeed({secretKeySeed: seedMultibase});
  const key = await Ed25519Multikey.generate({seed});
  const signer = key.signer();
  // The issuer needs to match the signer or the controller of the signer
  const issuer = `did:key:${key.publicKeyMultibase}`;
  // verificationMethod needs to be a fragment
  // this only works for did:key
  signer.id = `${issuer}#${key.publicKeyMultibase}`;
  return {signer, issuer};
};

/**
 * Creates a hash digest function using node's crypto lib.
 *
 * @param {object} options - Options to use.
 * @param {string} [options.algorithm = 'sha256'] - An openssl
 *   compatible hashing algorithm.
 *
 * @returns {Function} The hashing algorithm.
 */
export function hashDigest({algorithm = 'sha256'} = {}) {
  /**
   * Hashes a string of data using SHA-256.
   *
   * @param {object} options - Options to use.
   * @param {string} options.string - The string to hash.
   *
   * @returns {Promise<Uint8Array>} The hash digest.
   */

  return async ({string}) => new Uint8Array(
    crypto.createHash(algorithm).update(string).digest());
}

export async function invalidCreateVerifyData({
  document,
  proof,
  documentLoader
}) {
  const sha512Digest = hashDigest({algorithm: 'sha512'});
  // get cached document hash
  let cachedDocHash;
  const {_hashCache} = this;
  if(_hashCache && _hashCache.document === document) {
    cachedDocHash = _hashCache.hash;
  } else {
    this._hashCache = {
      document,
      // canonize and hash document
      hash: cachedDocHash =
        this.canonize(document, {documentLoader})
          .then(c14nDocument => sha512Digest({string: c14nDocument}))
    };
  }

  // await both c14n proof hash and c14n document hash
  const [proofHash, docHash] = await Promise.all([
    // canonize and hash proof
    this.canonizeProof(proof, {document, documentLoader})
      .then(c14nProofOptions => sha512Digest({string: c14nProofOptions})),
    cachedDocHash
  ]);
  // concatenate hash of c14n proof options and hash of c14n document
  return _concatTypedArrays(proofHash, docHash);
}

/**
 * Concatenates two Uint8Arrays.
 *
 * @param {Uint8Array} b1 - A UInt8Array.
 * @param {Uint8Array} b2 - A Uint8Array.
 *
 * @returns {Uint8Array} The result.
 */
function _concatTypedArrays(b1, b2) {
  const rval = new Uint8Array(b1.length + b2.length);
  rval.set(b1, 0);
  rval.set(b2, b1.length);
  return rval;
}

