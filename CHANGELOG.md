# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2026-10-29]

### Added

- `columns` option for the Top Languages `compact` layout. The compact card was hard-coded to two
  columns, so more languages only ever made it taller. `&columns=` (1–4, default `2`) now lays the
  languages out across the requested number of columns — wider and shorter — with the card's default
  canvas widening to match and the inter-column gap distributed across the available width. Height
  and existing two-column output are unchanged when the option is omitted.

## [2026-10-28]

### Fixed

- Token lookup in `src/common/retryer.js` only ever read `PAT_1`, `PAT_2`, etc., so a deployment
  with just a `TOKEN` variable set got "No GitHub API tokens found" on every request. `getToken()`
  now falls back to `TOKEN` for the first attempt when no `PAT_n` vars exist, with `PAT_1` taking
  precedence if both are present.
