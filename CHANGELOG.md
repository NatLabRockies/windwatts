# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-07-20

### Breaking Changes

- **Removed legacy API endpoints** (`/wtk/*` and `/era5/*`). These routes were deprecated in v1 and have now been removed.
  - Migrate to the unified `/v1/{model}/` endpoints. See the [Migration Guide](docs/06-migration.md).

### Changed

- API version bumped from `1.0.0` to `2.0.0`.
- Removed orphaned controller files: `wtk_data_controller.py`, `era5_data_controller.py`.

---

## [1.0.0] - Initial release

- Introduced unified `/v1/{model}/` API endpoints.
- Legacy model-specific routes (`/wtk/*`, `/era5/*`) marked deprecated.
- Supported models: `era5-quantiles`, `era5-timeseries`, `wtk-timeseries`, `ensemble-quantiles`.
