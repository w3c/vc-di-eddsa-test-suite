# w3c/vc-di-eddsa-test-suite ChangeLog

## 2.3.0 -

### Changed
- `respecConfig.json` is now `config/respec.json`.
- `abstract.hbs` is now `config/abstract.hbs`.
- `localImplementationsConfig.cjs` is now `localConfig.cjs`

### Added
- Add `config/runner.json` for configuring the tag used for the suite.

## 2.2.0 - 2024-01-11

### Added
- Add initial tests for `eddsa-jcs-2022`.
- Get VC issuer for test data generation from test config. This will allow
  testers to specify the VC issuer for generating the test data for the
  `eddsa-jcs-2022` tests. The default value has been set to `bovine`.

## 2.1.0 - 2023-12-21

### Added
- Add a default key seed to the vc-generator.

### Fixed
- Interop tests records results more accurately.

## 2.0.0 - 2023-11-27

### Added
- Add test to check whether dereferencing the `verificationMethod` results in an
  object containing a type property with `Multikey` value.
- Add test to check whether `publicKeyMultibase` is 34 bytes in length and is
  multibase base58-btc encoded.
- Adds test to check whether `proof.proofPurpose` field matches the verification
  relationship expressed by the verification method controller.

### Changed
- **BREAKING**: The tests require the cryptosuite type value to be either
  `eddsa-rdfc-2022` or `eddsa-jcs-2022`.
- **BREAKING**: The tags required for the test suite have been updated, shifting
  from `eddsa-2022` to `eddsa-rdfc-2022` and/or `eddsa-jcs-2022`.
- Test VCs now use `data-integrity/v2` context.

### Removed
- Removed unused `generate-credentials` script.

## 1.0.0 - 2023-11-09

### Added
- Add a new reporter option that generates the JSON used to create the report.

### Changed
- Use `@digitalbazaar/mocha-w3c-interop-reporter@1.5.0`.

## Before 1.0.0

- See git history for changes.
