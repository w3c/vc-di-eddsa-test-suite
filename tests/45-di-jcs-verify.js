/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {config} from './helpers.js';
import {endpoints} from 'vc-test-suite-implementations';

const {tags} = config.suites['eddsa-jcs-2022'];
// only use implementations with `eddsa-jcs-2022` verifiers.
const {match: verifierMatches} = endpoints.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});

checkDataIntegrityProofVerifyErrors({
  implemented: verifierMatches,
  testDescription: 'Data Integrity (eddsa-jcs-2022 verifiers)'
});
