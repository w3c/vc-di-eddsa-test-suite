# w3c/vc-di-eddsa-test-suite ChangeLog

## 2.0.0 - 2023-11-16

### Added
- Add test to check if dereferencing the `verificationMethod` results in an
  object containing a type property with `Multikey` value.
- Add test to check if `publicKeyMultibase` is 34 bytes in length and is
  multibase base58-btc encoded.
- Adds test to check if `proof.proofPurpose` field matches the verification
  relationship expressed by the verification method controller.

### Changed
- **BREAKING**: The tests require the cryptosuite type value to be either `eddsa-rdfc-2022`
  or `eddsa-jcs-2022`.

### Removed
- Removed unused `generate-credentials` script.

## 1.0.0 - 2023-11-09

### Added
- Add a new reporter option that generates the JSON used to create the report.

### Changed
- Use `@digitalbazaar/mocha-w3c-interop-reporter@1.5.0`.

## Before 1.0.0

- See git history for changes.
