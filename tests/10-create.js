/*!
 * Copyright 2022 Digital Bazaar, Inc. All Rights Reserved
 */

import chai from 'chai';
import {
  checkDataIntegrityProofFormat
} from 'data-integrity-test-suite-assertion';
import {endpoints} from 'vc-api-test-suite-implementations';
import {generateTestData} from './vc-generator/index.js';
import {createInitialVc} from './helpers.js';
import {klona} from 'klona';

const tag = 'eddsa-2022';
const {match, nonMatch} = endpoints.filterByTag({tags: [tag], property: 'issuers'});
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
    notImplemented: nonMatch,
    tag
  });
  describe('eddsa-2022 (issuer)', function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [...match.keys()];
    this.notImplemented = [...nonMatch.keys()];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    for(const [name, {endpoints, implementation}] of match) {
      const [issuer] = endpoints;
      const verifier = implementation.verifiers.find(
        v => v.tags.has(tag));
      let issuedVc;
      before(async function() {
        issuedVc = await createInitialVc({issuer});
      });
    }
  });
});
