/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {bs58Decode, bs58Encode, config} from './helpers.js';
import {verificationFail, verificationSuccess} from './assertions.js';
import {createInitialVc} from './helpers.js';
import {endpoints} from 'vc-test-suite-implementations';
import {generateTestData} from './vc-generator/index.js';
import {issuerNameJCS} from './test-config.js';

const {tags} = config.suites['eddsa-jcs-2022'];
// only use implementations with `eddsa-jcs-2022` verifiers.
const {match: verifierMatches} = endpoints.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});

describe.skip('eddsa-jcs-2022 (verify)', function() {
  let issuedVc;
  let credentials;
  before(async function() {
    const {match: issuerMatches} = endpoints.filterByTag({
      tags: [...tags],
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
        /**
         * Sanity integration check for the verifier.
         *
         * This does not come from the spec but is useful for integrations.
         */
        it('verifies a valid eddsa-jcs-2022 proof.',
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
        it('fails verification when credential is not canonicalized correctly.',
          async function() {
            this.test.cell = {columnId, rowId: this.test.title};
            const credential = credentials.clone('canonizeUnknown');
            await verificationFail({credential, verifier});
          }
        );
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
