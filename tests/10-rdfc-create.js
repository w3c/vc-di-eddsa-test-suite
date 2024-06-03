/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  bs58Decode, config, createInitialVc, getPublicKeyBytes, shouldBeBs58
} from './helpers.js';
import chai from 'chai';
import {documentLoader} from './documentLoader.js';
import {endpoints} from 'vc-test-suite-implementations';
import {from as fromEncodedMultikey} from '@digitalbazaar/ed25519-multikey';
import {generateTestData} from './vc-generator/index.js';

const cryptosuite = 'eddsa-rdfc-2022';
const {tags} = config.suites['eddsa-rdfc-2022'];
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'issuers'
});
const should = chai.should();

describe('eddsa-rdfc-2022 (create)', function() {
  let validVc;
  before(async function() {
    const credentials = await generateTestData();
    validVc = credentials.clone('validVc');
  });
  describe('eddsa-rdfc-2022 (issuer)', function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [...match.keys()];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    for(const [columnId, {endpoints, implementation}] of match) {
      describe(columnId, function() {
        const [issuer] = endpoints;
        const verifier = implementation.verifiers.find(
          // FIXME use Set's isSubsetOf in the future
          v => tags.every(tag => v.tags.has(tag)));
        let issuedVc;
        let proofs;
        const verificationMethodDocuments = [];
        before(async function() {
          issuedVc = await createInitialVc({issuer, vc: validVc});
          proofs = Array.isArray(issuedVc?.proof) ?
            issuedVc.proof : [issuedVc?.proof];
          const verificationMethods = proofs.map(
            proof => proof.verificationMethod);
          for(const verificationMethod of verificationMethods) {
            const verificationMethodDocument = await documentLoader({
              url: verificationMethod
            });
            verificationMethodDocuments.push(verificationMethodDocument);
          }
        });
        /**
         * @see {@link https://www.w3.org/TR/vc-di-eddsa/#dataintegrityproof}
         *
         * "The cryptosuite property of the proof MUST be eddsa-rdfc-2022
         * or eddsa-jcs-2022."
         */
        it('The field "cryptosuite" MUST be "eddsa-rdfc-2022".', function() {
          this.test.cell = {columnId, rowId: this.test.title};
          const suites = proofs.map(p => p?.cryptosuite);

          suites.some(
            suite => suite === cryptosuite
          ).should.equal(true, 'Expected at least one proof to have ' +
            '"cryptosuite" with the value "eddsa-rdfc-2022": ' +
            JSON.stringify(suites) + ' does not contain "eddsa-rdfc-2022".');
        });
        /**
         * @see {@link https://www.w3.org/TR/vc-di-eddsa/#ed25519signature2020}
         *
         * "The verificationMethod property of the proof MUST be a URL.
         * Dereferencing the verificationMethod MUST result in an object
         * containing a type property with the value set
         * to Ed25519VerificationKey2020."
         */
        it('Dereferencing the "verificationMethod" MUST result in an ' +
          'object containing a type property with the value set to "Multikey".',
        function() {
          this.test.cell = {columnId, rowId: this.test.title};
          verificationMethodDocuments.should.not.eql([], 'Expected ' +
            'at least one "verificationMethodDocument".');
          verificationMethodDocuments.some(
            verificationMethodDocument =>
              verificationMethodDocument?.type === 'Multikey'
          ).should.equal(true, 'Expected at least one proof to have "type" ' +
            'property value "Multikey".');
        });
        /**
         * @see {@link https://www.w3.org/TR/vc-di-eddsa/#dataintegrityproof}
         *
         * "The proofPurpose property of the proof MUST be a string,
         * and MUST match the verification relationship expressed
         * by the verification method controller."
         */
        it('The "proof.proofPurpose" field MUST match the verification ' +
          'relationship expressed by the verification method controller.',
        async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          verificationMethodDocuments.should.not.eql([], 'Expected ' +
            'at least one "verificationMethodDocument".');
          verificationMethodDocuments.some(
            verificationMethodDocument =>
              verificationMethodDocument?.type === 'Multikey'
          ).should.equal(true, 'Expected at least one proof to have "type" ' +
            'property value "Multikey".'
          );
          const controllerDocuments = [];
          for(const verificationMethodDocument of verificationMethodDocuments) {
            const controllerDocument = await documentLoader({
              url: verificationMethodDocument.controller
            });
            controllerDocuments.push(controllerDocument);
          }
          proofs.some(
            proof => controllerDocuments.some(controllerDocument =>
              controllerDocument.hasOwnProperty(proof.proofPurpose))
          ).should.equal(true, 'Expected "proof.proofPurpose" field ' +
             'to match the verification method controller.'
          );
        });
        /**
         * @see {@link https://www.w3.org/TR/vc-di-eddsa/#multikey}
         *
         * "The publicKeyMultibase value of the verification method
         * MUST start with the base-58-btc prefix (z)"
         */
        it('The "publicKeyMultibase" value of the verification method MUST ' +
          'be 34 bytes in length and start with the base-58-btc prefix (z).',
        async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          verificationMethodDocuments.should.not.eql([], 'Expected ' +
            'at least one "verificationMethodDocument".');
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
            const publicKeyMultibaseBytes = bs58Decode({
              id: publicKeyMultibase
            });
            publicKeyMultibaseBytes.byteLength.should.equal(34, 'Expected ' +
              '"publicKeyMultibase" value of the verification method to ' +
              'be 34 bytes in length.');
          }
        });
        /**
         * @see {@link https://www.w3.org/TR/vc-di-eddsa/#multikey}
         *
         * "A Multibase-encoded Multikey value follows, which MUST consist
         * of a binary value that starts with the two-byte prefix 0xed01,
         * which is the Multikey header for an Ed25519 public key, followed
         * by the 32-byte public key data, all of which is then encoded
         * using base-58-btc. Any other encoding MUST NOT be allowed."
         */
        it('["publicKeyMultibase"] MUST consist of a binary value that starts' +
          'with the two-byte prefix 0xed01', async function() {
          this.test.cell = {columnId, rowId: this.test.title};

          verificationMethodDocuments.should.not.eql([], 'Expected ' +
            'at least one "verificationMethodDocument".');

          for(const verificationMethodDocument of verificationMethodDocuments) {
            // If we can decode then the key is valid
            const {publicKey} =
              await fromEncodedMultikey(verificationMethodDocument);

            publicKey.length.should.equal(32, 'Expected public key ' +
              'to be 32 bytes.');
          }
        }),
        /**
         * @see {@link https://www.w3.org/TR/vc-di-eddsa/#dataintegrityproof}
         *
         * "The proofValue property of the proof MUST be a detached EdDSA
         * produced according to [RFC8032], encoded using the base-58-btc
         * header and alphabet as described in the Multibase
         * section of [VC-DATA-INTEGRITY]."
         */
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
            'eddsa-rdfc-2022 cryptosuite.');
          for(const proof of eddsa2022Proofs) {
            should.exist(proof.proofValue, 'Expected a proof value on ' +
              'the proof.');
            const valueBytes = bs58Decode({id: proof.proofValue});
            should.exist(proof.verificationMethod);
            const vmBytes = await getPublicKeyBytes({
              did: proof.verificationMethod});
            vmBytes.byteLength.should.be.oneOf([32, 57], 'Expected public ' +
              'key length to be either 32 or 57 bytes.');
            if(vmBytes.byteLength === 32) {
              valueBytes.byteLength.should.equal(64, 'Expected 64 byte ' +
                'proofValue for 32 byte key.');
            } else {
              valueBytes.byteLength.should.equal(114, 'Expected 114 byte ' +
                'proofValue for 57 byte key.');
            }
          }
        });
        /**
         * Sanity check to ensure that the verifier is capable of
         * verifying the result.
         *
         * This assertion is not directly related to the specification.
         */
        it('"proof" MUST verify when using a conformant verifier.',
          async function() {
            this.test.cell = {columnId, rowId: this.test.title};
            should.exist(verifier, 'Expected implementation to have a VC ' +
              'API compatible verifier.');
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
      });
    }
  });
});
