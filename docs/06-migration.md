# API Migration Guide: Legacy --> v1

The legacy model-specific endpoints (`/wtk/*`, `/era5/*`) were removed in API v2.0.0. All functionality is available through the unified v1 API.

For full endpoint details and parameters, see the **interactive API docs** at `/api/docs` when the app is running.

## Route Structure

```
Legacy:  /api/wtk/<endpoint>   →   /api/v1/wtk-timeseries/<endpoint>
Legacy:  /api/era5/<endpoint>  →   /api/v1/era5-quantiles/<endpoint>
```

## Endpoint Mapping

| Legacy | v1 Equivalent |
|---|---|
| `GET /api/wtk/windspeed` | `GET /api/v1/wtk-timeseries/windspeed` |
| `GET /api/wtk/energy-production` | `GET /api/v1/wtk-timeseries/production` |
| `GET /api/wtk/download-csv` | `GET /api/v1/wtk-timeseries/timeseries` |
| `POST /api/wtk/download-csv-batch` | `POST /api/v1/wtk-timeseries/timeseries/batch` |
| `GET /api/wtk/nearest-locations` | `GET /api/v1/wtk-timeseries/grid-points` |
| `GET /api/wtk/available-powercurves` | `GET /api/v1/turbines` |
| `GET /api/era5/windspeed` | `GET /api/v1/era5-quantiles/windspeed` |
| `GET /api/era5/production` | `GET /api/v1/era5-quantiles/production` |
| `GET /api/era5/timeseries` | `GET /api/v1/era5-timeseries/timeseries` |
| `POST /api/era5/timeseries/batch` | `POST /api/v1/era5-timeseries/timeseries/batch` |
| `GET /api/era5/grid-points` | `GET /api/v1/era5-quantiles/grid-points` |
| `GET /api/era5/powercurves` | `GET /api/v1/turbines` |

## Notable Changes

- **Period** — path-based period (e.g. `/windspeed/{avg_type}`) is now a query parameter: `?period=`.
- **Turbine** — the `powercurve` query parameter is deprecated and the renamed and recommended query parameter is `turbine`.
