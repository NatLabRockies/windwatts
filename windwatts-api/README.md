# WindWatts API (Backend)

This directory contains the Python backend for WindWatts, built with FastAPI.

For development instructions, setup guides, and architecture details, please see the **[Backend Documentation](../docs/03-backend.md)**.

This project is set up like a standard Python project. The initialization
process also creates a virtualenv within this project, stored under the `.venv`
directory. To create the virtualenv it assumes that there is a `python3`
(or `python` for Windows) executable in your path with access to the `venv`
package. If for any reason the automatic creation of the virtualenv fails,
you can create the virtualenv manually.

The project has a Makefile with the following targets:

- `make setup` initializes the project
- `make run` runs the webservice layer locally for testing

To manually create a virtualenv on MacOS and Linux:

```
$ python3 -m venv .venv
```

After the init process completes and the virtualenv is created, you can use the following
step to activate your virtualenv.

```
$ source .venv/bin/activate
```

If you are a Windows platform, you would activate the virtualenv like this:

```
% .venv\Scripts\activate.bat
```

Once the virtualenv is activated, you can install the required dependencies.

```
$ pip install -r requirements.txt
```

## Useful commands

- `uvicorn app.main:app --reload` runs the webservice layer locally for testing

## Database Configuration

### Local Development
The project uses PostgreSQL for data storage. For local development:

1. Add the following to `.env` in the api root:
```.env
DATABASE_URL=postgresql://windwatts:windwatts@postgres:5432/windwatts_db
POSTGRES_USER=windwatts
POSTGRES_PASSWORD=windwatts
POSTGRES_DB=windwatts_db
```

2. Start the services using docker-compose:
```bash
docker-compose up
```

The local PostgreSQL instance will be available at:
- Host: postgres
- Port: 5432
- Database: windwatts_db
- Username: windwatts
- Password: windwatts

### Production Deployment TODOs
For production deployment, the following items need to be configured by the cloud team:

1. Set up an RDS PostgreSQL instance in AWS
2. Configure the following in AWS Secrets Manager:
   - Database connection string (DATABASE_URL)
   - Other necessary database credentials
3. Update the appfleet configuration to:
   - Remove the local postgres service
   - Include the AWS Secrets Manager ARN for database configuration
   - Configure necessary IAM roles for RDS access

## Data Source Configuration (Athena / S3)

The API resolves its wind-data source config (Athena DB/workgroup/tables and S3
buckets) through `ConfigManager` (`app/config_manager.py`). Bucket names and other
infra values are **not** committed to this repo — in production they are hand-created
in **AWS SSM Parameter Store** and injected as environment variables.

`ConfigManager.get_config()` resolves in this order:

1. **Environment variables** — the production path (SSM → env vars).
2. **Local JSON** — `app/config/windwatts_data_config.json`, dev-only fallback.

### Running the env-var path locally

To replicate production locally, provide the values as env vars instead of relying
on the local JSON. Create a `.env` in the api root (`windwatts-api/.env`) — it is
gitignored (`.env`, `.env.*`), so real bucket names stay out of the repo.

**Which values to put in:** mirror the structure of
[`app/config/sample_windwatts_data_config.json`](app/config/sample_windwatts_data_config.json)
(real values come from the team / SSM). Each JSON key maps to an env var:

| JSON | Env var |
| --- | --- |
| top-level `region_name` | `REGION_NAME` |
| top-level `output_location` | `OUTPUT_LOCATION` |
| top-level `database` | `DATABASE` |
| top-level `athena_workgroup` | `ATHENA_WORKGROUP` |
| `sources.<model>.bucket_name` | `SOURCES_<MODEL>_BUCKET_NAME` |
| `sources.<model>.athena_table_name` | `SOURCES_<MODEL>_ATHENA_TABLE_NAME` |

`<MODEL>` is the `MODEL_CONFIG` key uppercased with `-` → `_`
(e.g. `era5-timeseries` → `SOURCES_ERA5_TIMESERIES_BUCKET_NAME`).

**Required fields depend on the model's `source`** (see `REQUIRED_FIELDS` in
`app/config_manager.py`):

- `source: "athena"` → needs `..._BUCKET_NAME` **and** `..._ATHENA_TABLE_NAME`
- `source: "s3"` → needs `..._BUCKET_NAME` only (no Athena table)

Example `.env`:

```.env
# Athena top-level
REGION_NAME=<aws-region>
OUTPUT_LOCATION=s3://<athena-results-bucket>/
DATABASE=<athena-database>
ATHENA_WORKGROUP=<athena-workgroup>

# Per-model sources
SOURCES_WTK_TIMESERIES_BUCKET_NAME=<bucket>
SOURCES_WTK_TIMESERIES_ATHENA_TABLE_NAME=<table>
SOURCES_ERA5_QUANTILES_BUCKET_NAME=<bucket>
SOURCES_ERA5_QUANTILES_ATHENA_TABLE_NAME=<table>
SOURCES_ENSEMBLE_QUANTILES_BUCKET_NAME=<bucket>
SOURCES_ENSEMBLE_QUANTILES_ATHENA_TABLE_NAME=<table>
SOURCES_WEM_QUANTILES_BUCKET_NAME=<bucket>
SOURCES_WEM_QUANTILES_ATHENA_TABLE_NAME=<table>

# era5-timeseries is an s3-only model: bucket only, no table
SOURCES_ERA5_TIMESERIES_BUCKET_NAME=<bucket>
```

Notes:
- All of `REGION_NAME`, `OUTPUT_LOCATION`, `DATABASE`, `ATHENA_WORKGROUP` plus at
  least one valid source must be set, or the env path is skipped entirely and the
  loader falls back to the local JSON.
- If the env config is incomplete it silently falls back to the local JSON. To be
  sure the env path was used, look for `Config loaded from environment variables.`
  in the startup logs.
- A `source: "athena"` model with a bucket but no table raises a clear `ValueError`
  at startup naming the model and the missing field.

### Running the env-var path in Docker

The `windwatts-api` service in `docker-compose.yml` already injects this file via
`env_file: ./windwatts-api/.env`, so the vars above are available in the container
on `docker compose up`.

Enjoy!
