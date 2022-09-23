/*!
 * Copyright 2022 Digital Bazaar, Inc. All Rights Reserved
 */

import chai from 'chai';
import {
  checkDataIntegrityProofFormat
} from 'data-integrity-test-suite-assertion';
import {endpoints} from 'vc-api-test-suite-implementations';
import {generateTestData} from './vc-generator/index.js';
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
});
