# [EdDSA](https://www.w3.org/TR/vc-di-eddsa/) Cryptosuite test suite

## Table of Contents

- [EdDSA Cryptosuite test suite](#eddsa-cryptosuite-test-suite)
  - [Table of Contents](#table-of-contents)
  - [Background](#background)
  - [Install](#install)
  - [Usage](#usage)
    - [Running Specific Tests](#Running-Specific-Tests)
    - [Testing Locally](#testing-locally)
    - [Changing the Test Tag](#Changing-the-test-tag)
  - [Implementation](#implementation)
  - [Docker Integration (TODO)](#docker-integration-todo)
  - [Contribute](#contribute)
  - [License](#license)

## Background
Provides interoperability tests for verifiable credential processors
(issuers and verifiers) that support [EdDSA](https://www.w3.org/TR/vc-di-eddsa/)
and [Data Integrity](https://www.w3.org/TR/vc-data-integrity/) cryptosuites.

## Install

```js
npm i
```

## Usage

To generate test data for `eddsa-jcs-2022` tests, testers can specify the
issuer name using the environment variable `ISSUER_NAME_JCS`.

If `$ISSUER_NAME_JCS` is not specified, `bovine` will be used.
```
ISSUER_NAME_JCS="IssuerNameJCS"  npm test
```

### Running Specific Tests
This suite uses [mocha.js](https://mochajs.org) as the test runner.
Mocha has [multiple options](https://mochajs.org/#command-line-usage) for filtering which tests run.

For example, the snippet below uses grep to filter tests by name and only runs one of the test suites.
```bash
mocha --grep '"specificProperty" test name' ./tests/10-specific-test-suite.js
```

### Testing Locally
If you want to test implementations or just endpoints running locally, you can
copy `localImplementationsConfig.example.cjs` to `.localImplementationsConfig.cjs`
in the root directory of the test suite.

```bash
cp localImplementationsConfig.example.cjs .localImplementationsConfig.cjs
```

Git is set to ignore `.localImplementationsConfig.cjs` by default.

This file must be a CommonJS module that exports an array of implementations:

```js
// .localImplementationsConfig.cjs defining local implementations
// you can specify a BASE_URL before running the tests such as:
// BASE_URL=http://localhost:40443/zDdfsdfs npm test
const baseUrl = process.env.BASE_URL || 'https://localhost:40443/id';
module.exports = [{
  name: 'My Company',
  implementation: 'My Implementation Name',
  issuers: [{
    id: 'did:myMethod:implementation:issuer:id',
    endpoint: `${baseUrl}/credentials/issue`,
    tags: ['eddsa-rdfc-2022', 'localhost']
  }],
  verifiers: [{
    id: 'did:myMethod:implementation:verifier:id',
    endpoint: `${baseUrl}/credentials/verify`,
    tags: ['eddsa-rdfc-2022', 'localhost']
  }]
}];
```

After adding the config file, both the localhost implementations and other
implementations matching the test tag will be included in the test run.

To specifically test only the localhost implementation, modify the test suite to
filter implementations based on a specific tag in your local configuration file.

For instance, if your `.localImplementationsConfig.cjs` config file looks like
the config above, you can adjust the tag used in each test suite by modifying `./config/runner.json`
to filter the implementations by `localhost` and other tags.

### Changing the Test Tag
These test suites use tags to identify which implementation's endpoints are used in tests.
If you need to change the tag the suites will run on you can change it in `./config/runner.json`.

## Implementation

You will need an issuer and verifier that are compatible with [VC API](https://w3c-ccg.github.io/vc-api/)
and are capable of handling issuance and verification of Verifiable Credentials
with `DataIntegrityProof` proof type using the `eddsa-rdfc-2022` or `eddsa-jcs-2022` cryptosuites.

To add your implementation to this test suite, you will need to add 2 endpoints
to your implementation manifest.
- A credential issuer endpoint (/credentials/issue) in the `issuers` property.
- A credential verifier endpoint (/credentials/verify) in the `verifiers`
  property.

All endpoints will need the tags either `eddsa-rdfc-2022` or `eddsa-jcs-2022`.

A simplified manifest would look like this:

```js
{
  "name": "My Company",
  "implementation": "My implementation",
  "issuers": [{
    "id": "",
    "endpoint": "https://issuer.mycompany.com/credentials/issue",
    "method": "POST",
    "tags": ["eddsa-rdfc-2022"]
  }, {
    "id": "",
    "endpoint": "https://issuer.mycompany.com/credentials/issue",
    "method": "POST",
    "tags": ["eddsa-jcs-2022"]
  }],
  "verifiers": [{
    "id": "",
    "endpoint": "https://verifier.mycompany.com/credentials/verify",
    "method": "POST",
    "tags": ["eddsa-rdfc-2022", "eddsa-jcs-2022"]
  }]
}
```

The example above represents an unauthenticated endpoint. You may add ZCAP or
OAuth2 authentication to your endpoints. You can find an example in the
[vc-test-suite-implementations README](https://github.com/w3c/vc-test-suite-implementations#adding-a-new-implementation).

To run the tests, some implementations may require client secrets that can be
passed as environment variables to the test script. To see which implementations require client
secrets, please check the implementation manifest within the
[vc-test-suite-implementations](https://github.com/w3c/vc-test-suite-implementations/tree/main/implementations) library.

## Docker Integration (TODO)

We are presently working on implementing a new feature that will enable the
use of Docker images instead of live endpoints. The Docker image that
you provide will be started when the test suite is run. The image is expected
to expose the API provided above, which will be used in the same way that
live HTTP endpoints are used above.

## Contribute

See [the CONTRIBUTING.md file](CONTRIBUTING.md).

Pull Requests are welcome!

## License

See [the LICENSE.md file](LICENSE.md)
