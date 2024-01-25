/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {config, createInitialVc} from './helpers.js';
import chai from 'chai';
import {endpoints} from 'vc-test-suite-implementations';
import {generateTestData} from './vc-generator/index.js';

const should = chai.should();

// only use implementations with `eddsa-rdfc-2022` issuers.
const {
  match: issuerMatches
} = endpoints.filterByTag({tags: [...config.tags], property: 'issuers'});
const {
  match: verifierMatches
} = endpoints.filterByTag({tags: [...config.tags], property: 'verifiers'});

describe('eddsa-rdfc-2022 (interop)', function() {
  let validVc;
  before(async function() {
    const credentials = await generateTestData();
    validVc = credentials.clone('validVc');
  });
  // this will tell the report
  // to make an interop matrix with this suite
  this.matrix = true;
  this.report = true;
  this.implemented = [...verifierMatches.keys()];
  this.rowLabel = 'Issuer';
  this.columnLabel = 'Verifier';
  for(const [issuerName, {endpoints}] of issuerMatches) {
    let issuedVc;
    before(async function() {
      const [issuer] = endpoints;
      try {
        issuedVc = await createInitialVc({issuer, vc: validVc});
      } catch(e) {
        console.error(`issuer ${issuerName} failed to issue interop VC`, e);
      }
    });
    for(const [verifierName, {endpoints}] of verifierMatches) {
      const [verifier] = endpoints;
      it(`${verifierName} should verify ${issuerName}`, async function() {
        this.test.cell = {rowId: issuerName, columnId: verifierName};
        should.exist(issuedVc, `Expected issuer: ${issuerName} to issue a VC`);
        const body = {
          verifiableCredential: issuedVc,
          options: {
            checks: ['proof']
          }
        };
        const {result, error} = await verifier.post({json: body});
        should.not.exist(error, 'Expected verifier to not error.');
        should.exist(result, 'Expected result from verifier.');
        should.exist(result.status, 'Expected verifier to return an HTTP' +
          'status code');
        result.status.should.equal(200, 'Expected HTTP status code to be 200.');
      });
    }
  }
});
