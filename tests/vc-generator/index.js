/*!
 * Copyright 2022 Digital Bazaar, Inc. All Rights Reserved
 */
import * as vc from '@digitalbazaar/vc';
import canonicalize from 'canonicalize';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {documentLoader} from './documentLoader.js';
import {
  cryptosuite as eddsa2022CryptoSuite
} from '@digitalbazaar/eddsa-2022-cryptosuite';
import {getMultikey} from './helpers.js';
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
  const signer = await getMultikey({
    seedMultibase: process.env.CLIENT_SECRET_DB
  });
  for(const [id, generator] of vcGenerators) {
    if(vcCache.get(id)) {
      continue;
    }
    const testData = await generator({signer});
    vcCache.set(id, testData);
  }
  return vcCache;
}

async function _issuedVc({signer}) {
  const suite = _createEddsa2022Suite({signer});
  const signedVc = await vc.issue({
    credential: klona(validVc),
    suite,
    documentLoader
  });
  return signedVc;
}

async function _incorrectCanonize({signer}) {
  const suite = _createEddsa2022Suite({signer});
  // canonize is expected to be async
  suite.canonize = async input => {
    // this will canonize using JCS
    return canonicalize(input);
  };
  const signedVc = await vc.issue({
    credential: klona(validVc),
    suite,
    documentLoader
  });
  return signedVc;
}

async function _incorrectDigest({signer}) {
  //FIXME replace the hash function
  const suite = _createEddsa2022Suite({signer});
  const hash = hashDigest({algorithm: 'sha512'});
  const signedVc = await vc.issue({
    credential: klona(validVc),
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
