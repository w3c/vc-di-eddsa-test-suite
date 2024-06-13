/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {config} from './helpers.js';
import {
  cryptosuite as eddsaRdfc2022CryptoSuite
} from '@digitalbazaar/eddsa-rdfc-2022-cryptosuite';
import {endpoints} from 'vc-test-suite-implementations';
import {getMultikey} from './vc-generator/helpers.js';

// only use implementations with `eddsa-rdfc-2022` verifiers.
const {tags} = config.suites['eddsa-rdfc-2022'];
const {match} = endpoints.filterByTag({
  tags: [...tags],
  property: 'verifiers'
});
const {key} = await getMultikey();
// options for the DI Verifier Suite
const testDataOptions = {
  suiteName: 'eddsa-rdfc-2022',
  cryptosuite: eddsaRdfc2022CryptoSuite,
  key
};

checkDataIntegrityProofVerifyErrors({
  implemented: match,
  testDescription: 'Data Integrity (eddsa-rdfc-2022 verifiers)',
  testDataOptions
});
