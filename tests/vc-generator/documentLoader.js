/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {contextMap} from './contexts.js';
// disable JsonLdDocumentLoader to prevent test data being marked static.
/*
import {JsonLdDocumentLoader} from 'jsonld-document-loader';
const jdl = new JsonLdDocumentLoader();

// add contexts to documentLoad
for(const [key, value] of contextMap) {
  jdl.addStatic(key, value);
}

export const documentLoader = jdl.build();
*/
export const documentLoader = url => {
  const document = contextMap.get(url);
  if(!document) {
    throw new Error(`Document not found in document loader: ${url}`);
  }
  return {
    contextUrl: null,
    documentUrl: url,
    document
  };
};
