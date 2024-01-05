/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
import {bs58Decode, bs58Encode} from './helpers.js';
import {verificationFail, verificationSuccess} from './assertions.js';
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {createInitialVc} from './helpers.js';
import {endpoints} from 'vc-test-suite-implementations';
import {generateTestData} from './vc-generator/index.js';
import {issuerNameJCS} from './test-config.js';

const tag = 'eddsa-jcs-2022';
// only use implementations with `eddsa-jcs-2022` verifiers.
const {match: verifierMatches} = endpoints.filterByTag({
  tags: [tag],
  property: 'verifiers'
});

describe('eddsa-jcs-2022 (verify)', function() {
  let issuedVc;
  let credentials;
  before(async function() {
    const {match: issuerMatches} = endpoints.filterByTag({
      tags: [tag],
      property: 'issuers'
    });
    // FIXME: Currently uses 'bovine' as default issuer to issue a verifiable
    // credential for the `eddsa-jcs-2022` verifier tests. This needs to be
    // updated in future to use either Digital Bazaar or generate the vc using
    // `vc-generator` helper.
    const [issuer] = issuerMatches.get(issuerNameJCS).endpoints;
    credentials = await generateTestData();
    const validVc = credentials.clone('validVc');
    issuedVc = await createInitialVc({issuer, vc: validVc});
  });
  checkDataIntegrityProofVerifyErrors({
    implemented: verifierMatches,
    testDescription: 'Data Integrity (eddsa-jcs-2022 verifiers)'
  });
  describe('eddsa-jcs-2022 (verifier)', function() {
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Verifier';
    this.implemented = [...verifierMatches.keys()];

    for(const [columnId, {endpoints}] of verifierMatches) {
      describe(columnId, function() {
      // wrap the testApi config in an Implementation class
        const [verifier] = endpoints;
        it('MUST verify a valid VC with an eddsa-jcs-2022 proof.',
          async function() {
            this.test.cell = {columnId, rowId: this.test.title};
            await verificationSuccess({credential: issuedVc, verifier});
          });
        it('If the "proofValue" field, when decoded to raw bytes, is not ' +
          '64 bytes in length if the associated public key is 32 bytes ' +
          'in length, or 114 bytes in length if the public key is 57 bytes ' +
          'in length, an error MUST be raised.', async function() {
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
          'an error MUST be raised.', async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('canonizeJcs');
          await verificationFail({credential, verifier});
        });
        it('If a canonicalization data hashing other than algorithm ' +
          'SHA-2-256 is used, an error MUST be raised.', async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('digestSha512');
          await verificationFail({credential, verifier});
        });
        it('If the "cryptosuite" field is not the string "eddsa-jcs-2022", ' +
          'an error MUST be raised.', async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const credential = credentials.clone('incorrectCryptosuite');
          await verificationFail({credential, verifier});
        });
      });
    }
  });
});
