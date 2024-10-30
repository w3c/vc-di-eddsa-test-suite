/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  config,
  createInitialVc,
  getProofs,
  isValidDatetime,
  isValidUtf8,
  setupMatrix,
  setupRow
} from './helpers.js';
import chai from 'chai';
import {endpoints} from 'vc-test-suite-implementations';
import {generateTestData} from './vc-generator/index.js';

const cryptosuite = 'eddsa-jcs-2022';
const {tags} = config.suites[
  'eddsa-jcs-2022'
];
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'issuers'
});
const should = chai.should();

describe('eddsa-jcs-2022 - Algorithms - Transformation', function() {
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
      let eddsa2022Proofs = [];
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validVc});
        proofs = getProofs(issuedVc);
        if(proofs?.length) {
          eddsa2022Proofs = proofs.filter(
            proof => proof?.cryptosuite === cryptosuite);
        }
      });
      beforeEach(setupRow);
      const assertBefore = () => {
        should.exist(issuedVc, 'Expected issuer to have issued a ' +
                    'credential.');
        should.exist(proofs, 'Expected credential to have a proof.');
        eddsa2022Proofs.length.should.be.gte(1, 'Expected at least one ' +
                    'eddsa-jcs-2022 cryptosuite.');
      };
      it('The transformation options MUST contain a type identifier ' +
        'for the cryptographic suite (type) and a cryptosuite identifier ' +
        '(cryptosuite).',
      async function() {
        this.test.link = 'https://w3c.github.io/vc-di-eddsa/#transformation-eddsa-jcs-2022';
        assertBefore();
        for(const proof of eddsa2022Proofs) {
          should.exist(proof.type, 'Expected a type identifier on ' +
                            'the proof.');
          should.exist(proof.cryptosuite,
            'Expected a cryptosuite identifier on the proof.');
        }
      });
      it('Whenever this algorithm encodes strings, it MUST use UTF-8 encoding.',
        async function() {
          this.test.link = 'https://w3c.github.io/vc-di-eddsa/#transformation-eddsa-jcs-2022';
          assertBefore();
          for(const proof of eddsa2022Proofs) {
            should.exist(proof?.proofValue,
              'Expected proofValue to exist.');
            isValidUtf8(proof.proofValue).should.equal(
              true,
              'Expected proofValue value to be a valid UTF-8 encoded string.'
            );
          }
        });
      it('If options.type is not set to the string DataIntegrityProof ' +
        'and options.cryptosuite is not set to the string eddsa-jcs-2022, ' +
        'an error MUST be raised that SHOULD convey an error type of ' +
        'PROOF_VERIFICATION_ERROR.',
      async function() {
        this.test.link = 'https://w3c.github.io/vc-di-eddsa/#transformation-eddsa-jcs-2022:~:text=If%20options.type%20is%20not%20set%20to%20the%20string%20DataIntegrityProof%20and%20options.cryptosuite%20is%20not%20set%20to%20the%20string%20eddsa%2Djcs%2D2022%2C%20an%20error%20MUST%20be%20raised%20that%20SHOULD%20convey%20an%20error%20type%20of%20PROOF_VERIFICATION_ERROR.';
        assertBefore();
        for(const proof of eddsa2022Proofs) {
          should.exist(proof.type,
            'Expected a type identifier on the proof.');
          should.exist(proof.cryptosuite,
            'Expected a cryptosuite identifier on the proof.');
          proof.type.should.equal('DataIntegrityProof',
            'Expected DataIntegrityProof type.');
          proof.cryptosuite.should.equal('eddsa-jcs-2022',
            'Expected eddsa-jcs-2022 cryptosuite.');
        }
      });
    });
  }
});

describe('eddsa-jcs-2022 - Algorithms - Proof Configuration', function() {
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
      let eddsa2022Proofs = [];
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validVc});
        proofs = getProofs(issuedVc);
        if(proofs?.length) {
          eddsa2022Proofs = proofs.filter(
            proof => proof?.cryptosuite === cryptosuite);
        }
      });
      beforeEach(setupRow);
      const assertBefore = () => {
        should.exist(issuedVc, 'Expected issuer to have issued a ' +
                    'credential.');
        should.exist(proofs, 'Expected credential to have a proof.');
        eddsa2022Proofs.length.should.be.gte(1, 'Expected at least one ' +
                    'eddsa-jcs-2022 cryptosuite.');
      };
      it('The proof options MUST contain a type identifier for the ' +
        'cryptographic suite (type) and MUST contain a cryptosuite ' +
        'identifier (cryptosuite).',
      async function() {
        this.test.link = 'https://w3c.github.io/vc-di-eddsa/#proof-configuration-eddsa-jcs-2022';
        assertBefore();
        for(const proof of eddsa2022Proofs) {
          should.exist(proof.type,
            'Expected a type identifier on the proof.');
          should.exist(proof.cryptosuite,
            'Expected a cryptosuite identifier on the proof.');
        }
      });
      it('If proofConfig.type is not set to DataIntegrityProof or ' +
        'proofConfig.cryptosuite is not set to eddsa-jcs-2022, ' +
        'an error MUST be raised that SHOULD convey an error type ' +
        'of PROOF_GENERATION_ERROR.',
      async function() {
        this.test.link = 'https://w3c.github.io/vc-di-eddsa/#proof-configuration-eddsa-jcs-2022:~:text=If%20proofConfig.type%20is%20not%20set%20to%20DataIntegrityProof%20or%20proofConfig.cryptosuite%20is%20not%20set%20to%20eddsa%2Djcs%2D2022%2C%20an%20error%20MUST%20be%20raised';
        assertBefore();
        for(const proof of eddsa2022Proofs) {
          should.exist(proof.type,
            'Expected a type identifier on the proof.');
          should.exist(proof.cryptosuite,
            'Expected a cryptosuite identifier on the proof.');
        }
      });
      it('If proofConfig.created is set to a value that is not a ' +
        'valid [XMLSCHEMA11-2] datetime, an error MUST be raised and ' +
        'SHOULD convey an error type of PROOF_GENERATION_ERROR.',
      async function() {
        this.test.link = 'https://w3c.github.io/vc-di-eddsa/#proof-configuration-eddsa-jcs-2022:~:text=If%20proofConfig.created%20is%20set%20to%20a%20value%20that%20is%20not%20a%20valid%20%5BXMLSCHEMA11%2D2%5D%20datetime%2C%20an%20error%20MUST%20be%20raised';
        for(const proof of eddsa2022Proofs) {
          if(proof?.created) {
            isValidDatetime(proof.created).should.equal(
              true,
              'Expected created value to be a valid datetime string.'
            );
          }
        }
      });
    });
  }
});

describe('eddsa-jcs-2022 - Algorithms - Proof Serialization', function() {
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
      let eddsa2022Proofs = [];
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validVc});
        proofs = getProofs(issuedVc);
        if(proofs?.length) {
          eddsa2022Proofs = proofs.filter(
            proof => proof?.cryptosuite === cryptosuite);
        }
      });
      const assertBefore = () => {
        should.exist(issuedVc,
          'Expected issuer to have issued a credential.');
        should.exist(proofs,
          'Expected credential to have a proof.');
        eddsa2022Proofs.length.should.be.gte(1,
          'Expected at least one eddsa-jcs-2022 cryptosuite.');
      };
      beforeEach(setupRow);
      it('The proof options MUST contain a type identifier ' +
        'for the cryptographic suite (type) and MAY contain a ' +
        'cryptosuite identifier (cryptosuite).',
      async function() {
        this.test.link = 'https://w3c.github.io/vc-di-eddsa/#proof-serialization-eddsa-jcs-2022';
        assertBefore();
        for(const proof of eddsa2022Proofs) {
          should.exist(proof.type,
            'Expected a type identifier on the proof.');
        }
      });
    });
  }
});
