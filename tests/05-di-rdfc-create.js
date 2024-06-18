/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  checkDataIntegrityProofFormat
} from 'data-integrity-test-suite-assertion';
import {config} from './helpers.js';
import {endpoints} from 'vc-test-suite-implementations';

const cryptosuite = 'eddsa-rdfc-2022';
const {tags} = config.suites[cryptosuite];
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'issuers'
});

checkDataIntegrityProofFormat({
  implemented: match,
  testDescription: 'Data Integrity (eddsa-rdfc-2022 issuers)',
  cryptosuiteName: 'eddsa-rdfc-2022'
});
