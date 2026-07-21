# API Migration Guide: Legacy --> v1

The legacy model-specific endpoints (`/wtk/*`, `/era5/*`) were removed in API v2.0.0. All functionality is available through the unified v1 API.

For full endpoint details and parameters, see the **interactive API docs** at `/api/docs` when the app is running.

## Route Structure

```
Legacy:  /wtk/<endpoint>   →   /v1/wtk-timeseries/<endpoint>
Legacy:  /era5/<endpoint>  →   /v1/era5-quantiles/<endpoint>
```

## Endpoint Mapping

| Legacy | v1 Equivalent |
|---|---|
| `GET /wtk/windspeed` | `GET /v1/wtk-timeseries/windspeed` |
| `GET /wtk/energy-production` | `GET /v1/wtk-timeseries/production` |
| `GET /wtk/download-csv` | `GET /v1/wtk-timeseries/timeseries` |
| `POST /wtk/download-csv-batch` | `POST /v1/wtk-timeseries/timeseries/batch` |
| `GET /wtk/nearest-locations` | `GET /v1/wtk-timeseries/grid-points` |
| `GET /wtk/available-powercurves` | `GET /v1/turbines` |
| `GET /era5/windspeed` | `GET /v1/era5-quantiles/windspeed` |
| `GET /era5/production` | `GET /v1/era5-quantiles/production` |
| `GET /era5/timeseries` | `GET /v1/era5-timeseries/timeseries` |
| `POST /era5/timeseries/batch` | `POST /v1/era5-timeseries/timeseries/batch` |
| `GET /era5/grid-points` | `GET /v1/era5-quantiles/grid-points` |
| `GET /era5/powercurves` | `GET /v1/turbines` |

## Notable Changes

- **Period** — path-based period (e.g. `/windspeed/{avg_type}`) is now a query parameter: `?period=`.
- **Turbine** — the `powercurve` query parameter is renamed to `turbine`.
