/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import crypto from 'crypto';
import {decodeSecretKeySeed} from 'bnid';

export const getMultikey = async ({
  // all else fails use the test key seed
  seedMultibase = 'z1AYMku6XEB5KV3XJbYzz9VejGJYRuqzu5wmq4JDRyUCjr8'
} = {}) => {
  if(!seedMultibase) {
    throw new Error('seedMultibase required');
  }
  // convert multibase seed to Uint8Array
  const seed = decodeSecretKeySeed({secretKeySeed: seedMultibase});
  const key = await Ed25519Multikey.generate({seed});
  const signer = key.signer();
  // The issuer needs to match the signer or the controller of the signer
  const issuer = `did:key:${key.publicKeyMultibase}`;
  key.controller = issuer;
  // verificationMethod needs to be a fragment
  key.id = signer.id = `${issuer}#${key.publicKeyMultibase}`;
  return {signer, issuer, key};
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

export function invalidCreateProof({
  addCreated = true,
  addVm = true,
  addProofPurpose = true,
  mockPurpose
}) {
  return async function({
    document,
    purpose,
    documentLoader
  }) {
    // build proof (currently known as `signature options` in spec)
    let proof;
    if(this.proof) {
      // shallow copy
      proof = {...this.proof};
    } else {
      // create proof JSON-LD document
      proof = {};
    }
    // ensure proof type is set
    proof.type = this.type;

    if(addCreated) {
    // set default `now` date if not given in `proof` or `options`
      let date = this.date;
      if(proof.created === undefined && date === undefined) {
        date = new Date();
      }
      // ensure date is in string format
      if(date && (date instanceof Date)) {
        // replace ms block with Z for seconds precision
        date = date.toISOString().replace(/\.\d+Z$/, 'Z');
      }
      // add API overrides
      if(date) {
        proof.created = date;
      }
    }

    if(addVm) {
      proof.verificationMethod = this.verificationMethod;
    }
    proof.cryptosuite = this.cryptosuite;
    // add any extensions to proof (mostly for legacy support)
    proof = await this.updateProof({
      document, proof, purpose, documentLoader
    });
    if(addProofPurpose) {
      if(mockPurpose) {
        proof.proofPurpose = mockPurpose;
      } else {
      // allow purpose to update the proof; the `proof` is in the
      // SECURITY_CONTEXT_URL `@context` -- therefore the `purpose` must
      // ensure any added fields are also represented in that same `@context`
        proof = await purpose.update(
          proof, {document, suite: this, documentLoader});
      }
    }

    // create data to sign
    const verifyData = await this.createVerifyData({
      document, proof, documentLoader
    });

    // sign data
    proof = await this.sign(
      {verifyData, document, proof, documentLoader});

    return proof;
  };
}

// used to create an invalid hash
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

