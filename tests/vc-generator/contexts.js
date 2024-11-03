/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  contexts as credentialsContexts,
  named as namedCredentialsContexts
} from '@digitalbazaar/credentials-context';
import dataIntegrityCtx from '@digitalbazaar/data-integrity-context';
import didCtx from '@digitalcredentials/did-context';
import multikeyCtx from '@digitalbazaar/multikey-context';

const contextMap = new Map(credentialsContexts);

const _dataIntegrityCtx = structuredClone(dataIntegrityCtx.CONTEXT);
const {
  id: v2ContextUrl,
  context: v2Context
} = structuredClone(namedCredentialsContexts.get('v2'));
const v2Ctx = v2Context['@context'];
const diCtx = _dataIntegrityCtx['@context'];
// add UnknownProofType to local context for test data
diCtx.UnknownProofType =
  structuredClone(_dataIntegrityCtx['@context'].DataIntegrityProof);
// add invalidPurpose to context for test data
diCtx.DataIntegrityProof['@context'].proofPurpose['@context'].invalidPurpose =
v2Ctx.DataIntegrityProof['@context'].proofPurpose['@context'].invalidPurpose = {
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
  v2ContextUrl,
  v2Context
);

export {contextMap};
