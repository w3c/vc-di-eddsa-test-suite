/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {bs58Decode, bs58Encode} from './helpers.js';
import {verificationFail, verificationSuccess} from './assertions.js';
import {endpoints} from 'vc-api-test-suite-implementations';
import {generateTestData} from './vc-generator/index.js';

// only use implementations with `eddsa-2022` verifiers.
const {match, nonMatch} = endpoints.filterByTag({
  tags: ['eddsa-2022'],
  property: 'verifiers'
});

describe('eddsa-2022 (verify)', function() {
  let credentials;
  before(async function() {
    credentials = await generateTestData();
  });
  describe('Data Integrity (verifier)', function() {
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Verifier';
    this.implemented = [...match.keys()];
    this.notImplemented = [...nonMatch.keys()];
    for(const [columnId, {endpoints}] of match) {
      describe(columnId, function() {
      // wrap the testApi config in an Implementation class
        const [verifier] = endpoints;
        it('If the "proof" field is missing or invalid, a MALFORMED error ' +
          'MUST be returned.', async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('issuedVc');
          delete credential.proof;
          await verificationFail({credential, verifier});
        });
        it('If the "type" field is missing or invalid, a MALFORMED error ' +
          'MUST be returned.', async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('issuedVc');
          delete credential.proof.type;
          await verificationFail({credential, verifier});
        });
        it('If the "created" field is missing or invalid, a MALFORMED error ' +
          'MUST be returned.', async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('noCreated');
          await verificationFail({credential, verifier});
        });
        it('If the "verificationMethod" field is missing or invalid, ' +
          'a MALFORMED error MUST be returned.', async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('issuedVc');
          delete credential.proof.verificationMethod;
          await verificationFail({credential, verifier});
        });
        it('If the "proofPurpose" field is missing or invalid, ' +
          'a MALFORMED error MUST be returned.', async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('issuedVc');
          delete credential.proof.proofPurpose;
          await verificationFail({credential, verifier});
        });
        it('If the "proofValue" field is missing or invalid, ' +
          'a MALFORMED error MUST be returned.', async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('issuedVc');
          delete credential.proof.proofValue;
          await verificationFail({credential, verifier});
        });
        it('If the "type" field is not the string "DataIntegrityProof", an ' +
          'UNKNOWN_CRYPTOSUITE_TYPE error MUST be returned.', async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('invalidProofType');
          await verificationFail({credential, verifier});
        });
      });
    }
  });
  describe('eddsa-2022 cryptosuite (verifier)', function() {
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Verifier';
    this.implemented = [...match.keys()];
    this.notImplemented = [...nonMatch.keys()];

    for(const [columnId, {endpoints}] of match) {
      describe(columnId, function() {
      // wrap the testApi config in an Implementation class
        const [verifier] = endpoints;
        it('MUST verify a valid VC with an eddsa-2022 proof',
          async function() {
            this.test.cell = {columnId, rowId: this.test.title};
            const credential = credentials.clone('issuedVc');
            await verificationSuccess({credential, verifier});
          });
        it('If the "proofValue" field is not a multibase-encoded base58-btc ' +
          'value, an INVALID_PROOF_VALUE error MUST be returned.',
        async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('issuedVc');
          credential.proof.proofValue = 'not-multibase-bs58-encoded!!';
          await verificationFail({credential, verifier});
        });
        it('If the "proofValue" field, when decoded to raw bytes, is not ' +
          '64 bytes in length if the associated public key is 32 bytes ' +
          'in length, or 114 bytes in length if the public key is 57 bytes ' +
          'in length, an INVALID_PROOF_LENGTH error MUST be returned.',
        async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('issuedVc');
          const proofBytes = bs58Decode({id: credential.proof.proofValue});
          const randomBytes = new Uint8Array(32).map(
            () => Math.floor(Math.random() * 255));
          credential.proof.proofValue = bs58Encode(
            new Uint8Array([...proofBytes, ...randomBytes]));
          await verificationFail({credential, verifier});
        });
        it('If a canonicalization algorithm other than URDNA2015 is used, ' +
          'a INVALID_PROOF_VALUE error MUST be returned.', async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('canonizeJcs');
          await verificationFail({credential, verifier});
        });
        it('If a canonicalization data hashing other than algorithm SHA-2-256' +
          ' is used, a INVALID_PROOF_VALUE error MUST be returned.',
        async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('digestSha512');
          await verificationFail({credential, verifier});
        });
        it('If the "cryptosuite" field is not the string "eddsa-2022", ' +
          'an UNKNOWN_CRYPTOSUITE_TYPE error MUST be returned.',
        async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('incorrectCryptosuite');
          await verificationFail({credential, verifier});
        });
      });
    }
  });
});
