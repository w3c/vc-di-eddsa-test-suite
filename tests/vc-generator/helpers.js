import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import {decodeSecretKeySeed} from 'bnid';

export const getMultikey = async ({seedMultibase}) => {
  if(!seedMultibase) {
    throw new Error('seedMultibase required');
  }
  // convert multibase seed to Uint8Array
  const seed = decodeSecretKeySeed({secretKeySeed: seedMultibase});
  const key = await Ed25519Multikey.generate({seed});
  const signer = key.signer();
  signer.id = `did:key:${key.publicKeyMultibase}#${key.publicKeyMultibase}`;
  return signer;
};
