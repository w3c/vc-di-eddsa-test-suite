/*!
 * Copyright 2022 Digital Bazaar, Inc. All Rights Reserved
 */
import {klona} from 'klona';
import {validVc} from './validVc.js';

const vcCache = new Map([
  ['validVc', klona(validVc)]
]);
export async function generateTestData() {
  return vcCache;
}
