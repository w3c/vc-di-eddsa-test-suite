/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import credentialsCtx from 'credentials-context';
import dataIntegrityCtx from '@digitalbazaar/data-integrity-context';
import didCtx from '@digitalcredentials/did-context';
import multikeyCtx from '@digitalbazaar/multikey-context';

// const credentialExamplesCtx = contexts[
//   'https://www.w3.org/2018/credentials/examples/v1'];
// const odrlCtx = contexts['https://www.w3.org/ns/odrl.jsonld'];

const contextMap = new Map();

// add contexts for the documentLoader
contextMap.set(multikeyCtx.constants.CONTEXT_URL, multikeyCtx.CONTEXT);
contextMap.set(
  dataIntegrityCtx.constants.CONTEXT_URL,
  dataIntegrityCtx.CONTEXT
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
