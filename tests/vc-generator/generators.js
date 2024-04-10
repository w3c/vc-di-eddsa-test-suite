/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as vc from '@digitalbazaar/vc';
import {
  invalidCreateProof,
  invalidCreateVerifyData
} from './helpers.js';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {documentLoader} from './documentLoader.js';
import {
  cryptosuite as eddsaRdfc2022CryptoSuite
} from '@digitalbazaar/eddsa-rdfc-2022-cryptosuite';
import jcsCanonicalize from 'canonicalize';
import {klona} from 'klona';

export const vcGenerators = new Map([
  ['issuedVc', _issuedVc],
  ['canonizeJcs', _canonizeJcs],
  ['canonizeUnknown', _canonizeUnknown],
  ['digestSha512', _incorrectDigest],
  ['invalidCryptosuite', _incorrectCryptosuite],
  ['invalidProofType', _incorrectProofType],
  ['noCreated', _noCreated],
  ['invalidCreated', _invalidCreated],
  ['noVm', _noVm],
  ['invalidVm', _invalidVm],
  ['noProofPurpose', _noProofPurpose],
  ['invalidProofPurpose', _invalidProofPurpose]
]);

async function _invalidProofPurpose({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({mockPurpose: 'invalidPurpose'});
  return _issueCloned({suite, credential});
}

async function _noProofPurpose({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({addProofPurpose: false});
  return _issueCloned({suite, credential});
}

async function _invalidVm({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.verificationMethod = 'did:key:@invalidVm@';
  return _issueCloned({suite, credential});
}

async function _noVm({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({addVm: false});
  return _issueCloned({suite, credential});
}

async function _invalidCreated({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.date = 'invalidDate';
  return _issueCloned({suite, credential});
}

async function _noCreated({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({addCreated: false});
  return _issueCloned({suite, credential});
}

async function _incorrectCryptosuite({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.cryptosuite = 'unknown-cryptosuite-2017';
  return _issueCloned({suite, credential});
}

async function _incorrectProofType({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.type = 'UnknownProofType';
  return _issueCloned({suite, credential});
}

async function _issuedVc({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  return _issueCloned({suite, credential});
}

async function _canonizeJcs({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  // canonize is expected to return a promise
  suite.canonize = async input => {
    return jcsCanonicalize(input);
  };
  return _issueCloned({suite, credential});
}

async function _canonizeUnknown({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  // canonize is expected to return a promise
  const prefix = 'unknown-';
  suite.canonize = async input => {
    const newObj = {};
    // Our dummy canonical algo adds a prefix to each key
    for(const key in input) {
      newObj[prefix + key] = input[key];
    }
    return JSON.stringify(newObj);
  };
  return _issueCloned({suite, credential});
}

async function _incorrectDigest({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createVerifyData = invalidCreateVerifyData;
  return _issueCloned({suite, credential});
}

function _createEddsa2022Suite({signer}) {
  // remove milliseconds precision
  const date = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const cryptosuite = eddsaRdfc2022CryptoSuite;
  return new DataIntegrityProof({signer, date, cryptosuite});
}

async function _issueCloned({suite, credential, loader = documentLoader}) {
  return vc.issue({
    credential: klona(credential),
    suite,
    documentLoader: loader
  });
}
