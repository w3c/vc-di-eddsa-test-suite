/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {config} from './helpers.js';
import {endpoints} from 'vc-test-suite-implementations';

// only use implementations with `eddsa-rdfc-2022` verifiers.
const {tags} = config.suites['eddsa-rdfc-2022'];
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});

checkDataIntegrityProofVerifyErrors({
  implemented: match,
  testDescription: 'Data Integrity (eddsa-rdfc-2022 verifiers)'
});
