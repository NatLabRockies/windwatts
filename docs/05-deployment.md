# Deployment Guide

## Local Development Deployment

Uses Docker Compose to run all services (API, UI, database, reverse proxy).

### Prerequisites

1. **Docker** and **Docker Compose** installed
2. **AWS credentials** with access to WindWatts data
3. **Google Maps API key** and Map ID

### Configuration

**1. Root Environment Variables (`.env`):**

Create a `.env` file in the project root:

```plaintext
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_SESSION_TOKEN=<your-session-token>
```

**2. UI Development Environment (`windwatts-ui/.env.development`):**

```plaintext
VITE_API_BASE_URL=http://windwatts-proxy:80
VITE_MAP_API_KEY=<your-map-api-key>
VITE_MAP_ID=<your-map-id>
```

**3. Data Configuration (`windwatts-api/app/config/windwatts_data_config.json`):**

Configure AWS Athena settings and data sources:

```json
{
  "region_name": "us-west-2",
  "output_location": "s3://your-athena-results-bucket/",
  "database": "your-glue-database",
  "athena_workgroup": "your-athena-workgroup",
  "sources": {
    "wtk-timeseries": {
      "bucket_name": "your-wtk-bucket",
      "athena_table_name": "wtk_table"
    },
    "era5-quantiles": {
      "bucket_name": "your-era5-bucket",
      "athena_table_name": "era5_table"
    },
    "ensemble-quantiles": {
      "bucket_name": "your-ensemble-bucket",
      "athena_table_name": "ensemble_table"
    },
    "wem-quantiles": {
      "bucket_name": "your-wem-bucket",
      "athena_table_name": "wem_table"
    }
  }
}
```

### Deploy

Start the application stack:

```shell
docker compose up --build
```

- **UI**: Access at `http://localhost:5173`
- **API**: Access at `http://localhost:8080` (via proxy)

Clean up:

```shell
docker compose down --volumes --remove-orphans
```

## Production Deployment

### Build Individual Services

**API:**

```shell
cd windwatts-api && docker build -t windwatts-api:latest .
```

**UI:**

```shell
cd windwatts-ui && docker build -t windwatts-ui:latest .
```

### AWS Configuration

- **RDS PostgreSQL**: Configure `DATABASE_URL` for production database
- **Environment Variables**: Set production AWS credentials and the data configuration (e.g. from Parameter Store). Required: `REGION_NAME`, `OUTPUT_LOCATION`, `DATABASE`, `ATHENA_WORKGROUP`, plus `SOURCES_<MODEL_KEY>_BUCKET_NAME` and `SOURCES_<MODEL_KEY>_ATHENA_TABLE_NAME` for each model (e.g. `SOURCES_ERA5_QUANTILES_BUCKET_NAME` for `era5-quantiles`; underscores map to hyphens). If these are not all set, the API falls back to `windwatts-api/app/config/windwatts_data_config.json`.
- **Load Balancer**: Route traffic to containerized services

API runs on port 8000 using Gunicorn with Uvicorn workers.
