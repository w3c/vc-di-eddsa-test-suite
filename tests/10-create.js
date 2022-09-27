/*!
 * Copyright 2022 Digital Bazaar, Inc. All Rights Reserved
 */

import {bs58Decode, createInitialVc, getPublicKeyBytes} from './helpers.js';
import chai from 'chai';
import {
  checkDataIntegrityProofFormat
} from 'data-integrity-test-suite-assertion';
import {endpoints} from 'vc-api-test-suite-implementations';
import {generateTestData} from './vc-generator/index.js';

const tag = 'eddsa-2022';
const cryptosuite = 'eddsa-2022';
const {match, nonMatch} = endpoints.filterByTag({
  tags: [tag],
  property: 'issuers'
});
const should = chai.should();
const bs58 = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

describe('eddsa-2022 (create)', function() {
  let validVc;
  before(async function() {
    const credentials = await generateTestData();
    validVc = credentials.get('validVc');
  });
  checkDataIntegrityProofFormat({
    implemented: match,
    notImplemented: nonMatch
  });
  describe('eddsa-2022 (issuer)', function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [...match.keys()];
    this.notImplemented = [...nonMatch.keys()];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    for(const [columnId, {endpoints, implementation}] of match) {
      const [issuer] = endpoints;
      const verifier = implementation.verifiers.find(
        v => v.tags.has(tag));
      let issuedVc;
      let proofs;
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc: validVc});
        proofs = Array.isArray(issuedVc?.proof) ?
          issuedVc.proof : [issuedVc?.proof];
      });
      it('MUST have property "cryptosuite"', function() {
        this.test.cell = {columnId, rowId: this.test.title};
        proofs.some(
          proof => typeof proof?.cryptosuite === 'string'
        ).should.equal(
          true,
          'Expected at least one proof to have cryptosuite.'
        );
      });
      it('The field "cryptosuite" MUST be `eddsa-2022`', function() {
        this.test.cell = {columnId, rowId: this.test.title};
        proofs.some(
          proof => proof?.cryptosuite === cryptosuite
        ).should.equal(
          true,
          'Expected at least one proof to have "cryptosuite" `eddsa-2022`.'
        );
      });
      it('"proofValue" field MUST exist and be a multibase-encoded ' +
          'base58-btc encoded value', function() {
        this.test.cell = {columnId, rowId: this.test.title};
        const multibase = 'z';
        proofs.some(proof => {
          const value = proof?.proofValue || '';
          return value.startsWith(multibase) && bs58.test(value);
        }).should.equal(
          true,
          'Expected "proof.proofValue" to be multibase-encoded base58-btc ' +
          'value.'
        );
      });
      it('"proofValue" field when decoded to raw bytes, MUST be 64 bytes ' +
        'in length if the associated public key is 32 bytes or 114 bytes ' +
        'in length if the public key is 57 bytes.', async function() {
        this.test.cell = {columnId, rowId: this.test.title};
        should.exist(issuedVc, 'Expected issuer to have issued a ' +
          'credential.');
        should.exist(proofs, 'Expected credential to have a proof.');
        const eddsa2022Proofs = proofs.filter(
          proof => proof?.cryptosuite === cryptosuite);
        eddsa2022Proofs.length.should.be.gte(1, 'Expected at least one ' +
          'Ed25519 proof.');
        for(const proof of eddsa2022Proofs) {
          should.exist(proof.proofValue, 'Expected a proof value on ' +
            'the proof.');
          const valueBytes = bs58Decode({id: proof.proofValue});
          should.exist(proof.verificationMethod);
          const vmBytes = await getPublicKeyBytes({
            did: proof.verificationMethod});
          vmBytes.byteLength.should.be.oneOf([32, 57], 'Expected public ' +
            'key bytes to be either 32 or 57 bytes.');
          if(vmBytes.byteLength === 32) {
            valueBytes.byteLength.should.equal(64, 'Expected 64 bytes ' +
              'proofValue for 32 bytes key.');
          } else {
            valueBytes.byteLength.should.equal(114, 'Expected 114 bytes ' +
              'proofValue for 57 bytes key.');
          }
        }
      });
      it('"proof" MUST verify when using a conformant verifier.',
        async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          should.exist(verifier, 'Expected implementation to have a VC ' +
            'HTTP API compatible verifier.');
          const {result, error} = await verifier.post({json: {
            verifiableCredential: issuedVc,
            options: {checks: ['proof']}
          }});
          should.not.exist(error, 'Expected verifier to not error.');
          should.exist(result, 'Expected verifier to return a result.');
          result.status.should.not.equal(400, 'Expected status code to not ' +
            'be 400.');
          result.status.should.equal(200, 'Expected status code to be 200.');
        });
    }
  });
});
