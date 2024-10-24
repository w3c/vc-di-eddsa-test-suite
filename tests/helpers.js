/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as didKey from '@digitalbazaar/did-method-key';
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import {IdDecoder, IdEncoder} from 'bnid';
import {documentLoader} from './documentLoader.js';
import {isUtf8} from 'node:buffer';
import {klona} from 'klona';
import {readFileSync} from 'fs';
import {v4 as uuidv4} from 'uuid';
import varint from 'varint';

export const config = JSON.parse(readFileSync('./config/runner.json'));

const multibaseMultikeyHeader = 'z6Mk';
const didKeyDriver = didKey.driver();
didKeyDriver.use({
  multibaseMultikeyHeader,
  fromMultibase: Ed25519Multikey.from
});
const decoder = new IdDecoder({
  encoding: 'base58',
  multibase: true
});

export function setupMatrix(match) {
  // this will tell the report
  // to make an interop matrix with this suite
  this.matrix = true;
  this.report = true;
  this.implemented = [...match.keys()];
  this.rowLabel = 'Test Name';
  this.columnLabel = 'Implementer';
}

export async function getProofs(issuedVc) {
  const proofs = Array.isArray(issuedVc?.proof) ?
    issuedVc.proof : [issuedVc?.proof];
  return proofs;
}

export async function getVerificationMethodDocuments(proofs) {
  const verificationMethodDocuments = [];
  const verificationMethods = proofs.map(
    proof => proof.verificationMethod);
  for(const verificationMethod of verificationMethods) {
    const verificationMethodDocument = await documentLoader({
      url: verificationMethod
    });
    verificationMethodDocuments.push(verificationMethodDocument);
  }
  return verificationMethodDocuments;
}

export const createInitialVc = async ({issuer, vc}) => {
  const {settings: {id: issuerId, options}} = issuer;
  const credential = klona(vc);
  credential.id = `urn:uuid:${uuidv4()}`;
  credential.issuer = issuerId;
  const body = {credential, options};
  const {data, error} = await issuer.post({json: body});
  if(error) {
    console.warn(`Issuance failed for ${issuer.settings.endpoint}`);
    console.error(error);
    console.log(JSON.stringify({body}, null, 2));
  }
  return data;
};

// base58, multibase, fixed-length encoder
const encoder = new IdEncoder({
  encoding: 'base58',
  multibase: true
});

export const getPublicKeyBytes = async ({did}) => {
  const didDoc = await didKeyDriver.get({did});
  const multiCodecBytes = decoder.decode(didDoc.publicKeyMultibase);
  // extracts the varint bytes
  varint.decode(multiCodecBytes);
  // how many bytes were used to specify the size of the key material
  const varBytes = varint.decode.bytes;
  // return just the key material
  return multiCodecBytes.slice(varBytes, multiCodecBytes.length);
};

export const bs58Decode = ({id}) => decoder.decode(id);

export const bs58Encode = data => encoder.encode(data);

// RegExp with bs58 characters in it
const bs58 =
  /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
// assert something is entirely bs58 encoded
export const shouldBeBs58 = s => bs58.test(s);

export function isValidUtf8(string) {
  const textEncoder = new TextEncoder();
  const uint8Array = textEncoder.encode(string);
  if(!isUtf8(uint8Array)) {
    return false;
  } else {
    return true;
  }
}

export function isValidDatetime(dateString) {
  return !isNaN(Date.parse(dateString));
}
