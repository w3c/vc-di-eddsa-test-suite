/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */

// FIXME: Currently uses 'bovine' as default issuer to issue a verifiable
// credential for the `eddsa-jcs-2022` verifier tests. This needs to be
// updated in future to use either Digital Bazaar or generate the vc using
// `vc-generator` helper.
export const issuerNameJCS = process.env.ISSUER_NAME_JCS || 'bovine';
