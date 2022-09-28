/*!
 * Copyright 2022 Digital Bazaar, Inc. All Rights Reserved
 */
import * as vc from '@digitalbazaar/vc';
import {concatTypeArrays, getMultikey} from './helpers.js';
import canonicalize from 'canonicalize';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {documentLoader} from './documentLoader.js';
import {
  cryptosuite as eddsa2022CryptoSuite
} from '@digitalbazaar/eddsa-2022-cryptosuite';
import {hashDigest} from './hashDigest.js';
import {klona} from 'klona';
import {validVc} from './validVc.js';

// cache test data for a single run
const vcCache = new Map([
  ['validVc', klona(validVc)]
]);

const vcGenerators = new Map([
  ['issuedVc', _issuedVc],
  ['canonizeJcs', _incorrectCanonize],
  ['digestSha512', _incorrectDigest]
]);

export async function generateTestData() {
  const {signer, issuer} = await getMultikey({
    seedMultibase: process.env.CLIENT_SECRET_DB
  });
  const credential = klona(validVc);
  credential.issuer = issuer;
  for(const [id, generator] of vcGenerators) {
    if(vcCache.get(id)) {
      continue;
    }
    const testData = await generator({signer, credential});
    vcCache.set(id, testData);
  }
  return vcCache;
}

async function _issuedVc({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  const signedVc = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader
  });
  return signedVc;
}

async function _incorrectCanonize({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  // canonize is expected to be async
  suite.canonize = async input => {
    // this will canonize using JCS
    return canonicalize(input);
  };
  const signedVc = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader
  });
  return signedVc;
}

async function _incorrectDigest({signer, credential}) {
  //FIXME replace the hash function
  const suite = _createEddsa2022Suite({signer});
  const sha512Digest = hashDigest({algorithm: 'sha512'});
  suite.createVerifyData = async function({document, proof, documentLoader}) {
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
    return concatTypeArrays(proofHash, docHash);
  };
  const signedVc = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader
  });
  return signedVc;
}

function _createEddsa2022Suite({signer}) {
  // remove milliseconds precision
  const date = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const cryptosuite = eddsa2022CryptoSuite;
  return new DataIntegrityProof({signer, date, cryptosuite});
}
