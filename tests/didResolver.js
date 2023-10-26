/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import * as didMethodKey from '@digitalbazaar/did-method-key';
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';

const multibaseMultikeyHeader = 'z6Mk';
const didKeyDriver = didMethodKey.driver();

didKeyDriver.use({
  multibaseMultikeyHeader,
  fromMultibase: Ed25519Multikey.from
});

export async function didResolver({url}) {
  if(url.startsWith('did:')) {
    return didKeyDriver.get({did: url});
  }
  throw new Error('DID Method not supported by resolver');
}
