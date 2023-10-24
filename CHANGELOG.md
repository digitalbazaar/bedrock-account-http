# bedrock-account-http ChangeLog

## 8.0.0 - 2023-10-xx

### Added
- Add optional `authorization` value when registering an account and
  define first instance of it that uses a captcha via the Cloudflare
  Turnstile service.

### Changed
- **BREAKING**: Drop support for Node.js < 18.
- Add `@bedrock/turnstile` peer dependency. This module requires Node.js 18+ and
  must be installed by top-level applications.

## 7.1.2 - 2023-10-24

### Fixed
- Remove `turnstile` related changes released in `7.1.0` and `7.1.1`. Due to
  a Node.js 18+ requirement in related dependencies, this functionality must
  be added in a future major, breaking v8.x release.

## 7.1.1 - 2023-10-20

### Fixed
- Remove unused `@bedrock/https-agent` dep.
- Move `@bedrock/turnstile` into `peerDependencies`.

## 7.1.0 - 2023-10-18

### Added
- Add optional `authorization` value when registering an account and
  define first instance of it that uses a captcha via the Cloudflare
  Turnstile service.

## 7.0.1 - 2023-01-24

### Fixed
- Fix peer dep: `@bedrock/passport@11`.

## 7.0.0 - 2023-01-24

### Added
- Add `post` method for updating accounts. Uses a simple post method that
  requires the full account to use to overwrite the existing one (whereby the
  `id` must continue to match) and the existing `sequence`.

### Changed
- **BREAKING**: Use `@bedrock/account@9`. This update changes the database
  record and layout for accounts in ways that incompatible with any previous
  releases. It also removes the `patch` method for updating, replacing it with
  simple overwrite + `sequence`.
- **BREAKING**: Changed exposed validator names to remove `bedrock` and use
  simple names.

### Removed
- **BREAKING**: Remove `patch` method for updating accounts, replaced with
  simple post for account updating.

## 6.0.0 - 2022-04-29

### Changed
- **BREAKING**: Update peer deps:
  - `@bedrock/core@6`
  - `@bedrock/account@8`
  - `@bedrock/express@8`
  - `@bedrock/passport@10`
  - `@bedrock/validation@7`.

## 5.0.0 - 2022-04-06

### Changed
- **BREAKING**: Rename package to `@bedrock/account-http`.
- **BREAKING**: Convert to module (ESM).
- **BREAKING**: Remove default export.
- **BREAKING**: Require node 14.x.

## 4.2.1 - 2022-03-26

### Changed
- Update peer deps to match those with ESM internals:
  - `bedrock-account@6.3.2`
  - `bedrock-express@6.4.1`
  - `bedrock-passport@8.1.0`
  - `bedrock-validation@^5.6.3`.

### Fixed
- Fix test suite.

## 4.2.0 - 2022-03-23

### Changed
- Update peer deps:
  - `bedrock@4.5`.
  - `bedrock-account@6.3`.

## 4.1.1 - 2022-03-23

### Fixed
- Fix linting errors.

## 4.1.0 - 2022-03-23

### Changed
- Use `esm.js` to transpile internals from ESM to CommonJS. Should be
  a non-breaking change.

## 4.0.0 - 2022-03-07

### Changed
- **BREAKING**: Update peer deps:
  - `bedrock@4.4`
  - `bedrock-validation@5.5`
  - `bedrock-mongodb@8.4`
  - `bedrock-passport@8`
- **BREAKING**: Disable cors on get account route to avoid CSRF attacks.
- **BREAKING**: Remove `schemas` directory from configured schemas, load
  locally only using the new `bedrock-validation@5` model.

### Removed
- **BREAKING**: Remove all usage of `bedrock-permission` including
  roles (e.g., `sysResourceRole`), `actor`, etc. All authz should
  be managed via HTTP (or other) APIs and technologies such as
  zcaps, meters, and oauth2.

## 3.1.0 - 2021-06-08

### Added
- Add `res` to autoLogin event params.

## 3.0.0 - 2021-03-19

### Changed
- **BREAKING**: Use bedrock-validation@5.0.0. Email addresses must be all
  lowercase.

## 2.0.0 - 2021-01-12

### Changed
- **BREAKING**: Remove limit option
- **BREAKING**: Update bedrock-account@5.

## 1.7.0 - 2020-07-07

### Changed
- Update test deps and CI workflow.

## 1.6.0 - 2020-06-29

### Changed
- Update peerDependencies to include bedrock-account@4.
- Update test deps and CI workflow.

## 1.5.1 - 2020-06-17

### Changed
- Update peer and test dependencies related to MongoDB upgrade.

## 1.5.0 - 2020-04-15

### Changed
- Enable CI workflow.
- Simplify package dependencies.

## 1.4.0 - 2020-03-04

### Added
- Add auto-login event for extending new account registration
  behavior.

## 1.3.0 - 2019-12-24

### Added
- Add auto-login feature for new account registrations.

## 1.2.0 - 2019-11-18

### Changed
- Update dependencies.

## 1.1.0 - 2019-02-20

### Added
- API endpoint to get an account's capabilities.
- API endpoint to change an account's status.
- Route for admins to get all accounts associated with an email.
- Route to change an account using JSON patches.
- More tests added to the project for all implemented routes.
- Validation and tests for all working routes.

## 1.0.0 - 2018-09-14

### Added
- Added core files.

- See git history for changes.
