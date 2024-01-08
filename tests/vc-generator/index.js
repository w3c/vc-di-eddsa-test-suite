/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {getMultikey} from './helpers.js';
import {klona} from 'klona';
import {validVc} from './validVc.js';
import {vcGenerators} from './generators.js';

// cache test data for a single run
const vcCache = new Map([
  ['validVc', klona(validVc)]
]);

/**
 * Calls the vc generators and then returns a Map
 * with the test data.
 *
 * @returns {Promise<Map>} Returns a Map of test data.
 */
export async function generateTestData() {
  const {signer, issuer} = await getMultikey({
    seedMultibase: (
      process.env?.KEY_SEED_DB ||
      process.env?.CLIENT_SECRET_DB ||
      // all else fails use the test key seed
      'z1AYMku6XEB5KV3XJbYzz9VejGJYRuqzu5wmq4JDRyUCjr8'
    )
  });
  const credential = klona(validVc);
  credential.issuer = issuer;
  for(const [id, generator] of vcGenerators) {
    if(vcCache.get(id)) {
      continue;
    }
    const testData = await generator({signer, credential});
    vcCache.set(id, testData);
  }
  return {
    clone(key) {
      return klona(vcCache.get(key));
    }
  };
}
