# bedrock-account-http ChangeLog

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
