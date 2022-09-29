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
// add UnknownProofType to local context for test data
_dataIntegrityCtx['@context'].UnknownProofType =
  klona(_dataIntegrityCtx['@context'].DataIntegrityProof);
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
