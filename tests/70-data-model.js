/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  bs58Decode,
  config,
  createInitialVc,
  getProofs,
  getVerificationMethodDocuments,
  setupMatrix,
  shouldBeBs58
} from './helpers.js';
import chai from 'chai';
import {endpoints} from 'vc-test-suite-implementations';
import {generateTestData} from './vc-generator/index.js';

const should = chai.should();
const cryptosuites = ['eddsa-rdfc-2022', 'eddsa-jcs-2022'];
const {tags} = config.suites[
  'eddsa-rdfc-2022',
  'eddsa-jcs-2022'
];
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'issuers'
});

describe('Data Model- Verification Methods (Multikey)', function() {
  setupMatrix.call(this, match);
  let validVc;
  before(async function() {
    const credentials = await generateTestData();
    validVc = credentials.clone('validVc');
  });
  for(const [columnId, {endpoints}] of match) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let issuedVc;
      let proofs;
      let verificationMethodDocuments = [];
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validVc});
        proofs = await getProofs(issuedVc);
        verificationMethodDocuments =
          await getVerificationMethodDocuments(proofs);
      });
      it('The publicKeyMultibase value of the verification method MUST ' +
        'start with the base-58-btc prefix (z), as defined in the ' +
        'Multibase section of Controller Documents 1.0.',
      async function() {
        this.test.link = '';
        verificationMethodDocuments.should.not.eql([],
          'Expected at least one "verificationMethodDocument".');
        for(const verificationMethodDocument of verificationMethodDocuments) {
          const multibase = 'z';
          const {publicKeyMultibase} = verificationMethodDocument;
          const isMultibaseEncoded =
              publicKeyMultibase.startsWith(multibase) &&
              shouldBeBs58(publicKeyMultibase);
          isMultibaseEncoded.should.equal(
            true,
            'Expected "publicKeyMultibase" value of the verification ' +
              'method to be multibase base58-btc encoded value'
          );
        }
      });
      it('Any other encoding MUST NOT be allowed.',
        async function() {
          this.test.link = '';
          verificationMethodDocuments.should.not.eql([],
            'Expected at least one "verificationMethodDocument".');
          for(const verificationMethodDocument of verificationMethodDocuments) {
            const multibase = 'z';
            const {publicKeyMultibase} = verificationMethodDocument;
            const isMultibaseEncoded =
              publicKeyMultibase.startsWith(multibase) &&
              shouldBeBs58(publicKeyMultibase);
            isMultibaseEncoded.should.equal(
              true,
              'Expected "publicKeyMultibase" value of the verification ' +
              'method to be multibase base58-btc encoded value'
            );
          }
        });
      it('The secretKeyMultibase value of the verification method ' +
        'MUST start with the base-58-btc prefix (z), as defined in the ' +
        'Multibase section of Controller Documents 1.0.',
      async function() {
        this.test.link = '';
        this.skip('Testing secret keys is out of scope.');
      });
      it('Any other encoding MUST NOT be allowed.',
        async function() {
          this.test.link = '';
          this.skip('Testing secret keys is out of scope.');
        });
    });
  }
});

describe('Data Model- Proof Representations (DataIntegrityProof)', function() {
  setupMatrix.call(this, match);
  let validVc;
  before(async function() {
    const credentials = await generateTestData();
    validVc = credentials.clone('validVc');
  });
  for(const [columnId, {endpoints}] of match) {
    describe(columnId, function() {
      const [issuer] = endpoints;
      let issuedVc;
      let proofs;
      let eddsa2022Proofs;
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validVc});
        proofs = await getProofs(issuedVc);
      });

      beforeEach(async function() {
        should.exist(issuedVc,
          'Expected issuer to have issued a credential.');
        should.exist(proofs,
          'Expected credential to have a proof.');
        eddsa2022Proofs = proofs.filter(
          proof => cryptosuites.includes(proof?.cryptosuite));

        eddsa2022Proofs.length.should.be.gte(1,
          'Expected eddsa-jcs-2022 or eddsa-rdfc-2022 cryptosuite.');
      });
      it('The type property MUST be DataIntegrityProof.',
        async function() {
          this.test.link = '';
          for(const proof of eddsa2022Proofs) {
            should.exist(proof.type,
              'Expected a type identifier on the proof.');
            proof.type.should.equal('DataIntegrityProof',
              'Expected DataIntegrityProof type.');
          }
        });
      it('The cryptosuite property of the proof MUST be ' +
        'eddsa-rdfc-2022 or eddsa-jcs-2022.',
      async function() {
        this.test.link = '';
        for(const proof of eddsa2022Proofs) {
          should.exist(proof.cryptosuite,
            'Expected a cryptosuite identifier on the proof.');
          proof.cryptosuite.should.be.oneOf(cryptosuites,
            'Expected eddsa-rdfc-2022 or eddsa-jcs-2022 cryptosuite.');
        }
      });
      it('The proofValue property of the proof MUST be a detached EdDSA ' +
        'signature produced according to [RFC8032], encoded using the ' +
        'base-58-btc header and alphabet as described in the ' +
        'Multibase section of Controller Documents 1.0.',
      async function() {
        this.test.link = '';
        for(const proof of eddsa2022Proofs) {
          should.exist(proof.proofValue,
            'Expected a proof value on the proof.');
          const valueBytes = bs58Decode({id: proof.proofValue});
          should.exist(valueBytes,
            'Expected to have a decoded proofValue.');
        }
      });
    });
  }
});
