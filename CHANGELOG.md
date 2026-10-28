# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2026-10-28]

### Fixed

- Token lookup in `src/common/retryer.js` only ever read `PAT_1`, `PAT_2`, etc., so a deployment
  with just a `TOKEN` variable set got "No GitHub API tokens found" on every request. `getToken()`
  now falls back to `TOKEN` for the first attempt when no `PAT_n` vars exist, with `PAT_1` taking
  precedence if both are present.
