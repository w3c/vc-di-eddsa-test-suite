/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import credentialsCtx from 'credentials-context';
import dataIntegrityCtx from '@digitalbazaar/data-integrity-context';
import didCtx from '@digitalcredentials/did-context';
import {klona} from 'klona';
import multikeyCtx from '@digitalbazaar/multikey-context';

const contextMap = new Map();

const _dataIntegrityCtx = klona(dataIntegrityCtx.CONTEXT);
const diCtx = _dataIntegrityCtx['@context'];
// add UnknownProofType to local context for test data
diCtx.UnknownProofType =
  klona(_dataIntegrityCtx['@context'].DataIntegrityProof);
// add InvalidProofPurpose to context for test data
diCtx.DataIntegrityProof['@context'].proofPurpose['@context'].invalidPurpose = {
  '@id': 'https://w3id.org/security#invalidPurpose',
  '@type': '@id',
  '@container': '@set'
};

// add contexts for the documentLoader
contextMap.set(multikeyCtx.constants.CONTEXT_URL, multikeyCtx.CONTEXT);
contextMap.set(
  dataIntegrityCtx.constants.CONTEXT_URL,
  _dataIntegrityCtx
);
contextMap.set(
  didCtx.constants.DID_CONTEXT_URL,
  didCtx.contexts.get(
    didCtx.constants.DID_CONTEXT_URL)
);
contextMap.set(
  credentialsCtx.constants.CONTEXT_URL,
  credentialsCtx.contexts.get(
    credentialsCtx.constants.CONTEXT_URL)
);

export {contextMap};
