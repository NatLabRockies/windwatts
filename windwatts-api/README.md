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

## Data Source Configuration

The API loads its wind-data source config (Athena database/workgroup/tables and S3
buckets) through `ConfigManager` (`app/config_manager.py`). It resolves values from
**environment variables** first, falling back to a local JSON file
(`app/config/windwatts_data_config.json`).

See [`app/config/sample_windwatts_data_config.json`](app/config/sample_windwatts_data_config.json)
for the structure. 

Each JSON key maps to an environment variable - the top-level
keys (`REGION_NAME`, `OUTPUT_LOCATION`, `DATABASE`, `ATHENA_WORKGROUP`) and the
per-model keys `SOURCES_<MODEL>_BUCKET_NAME` and `SOURCES_<MODEL>_ATHENA_TABLE_NAME`,
where `<MODEL>` is the model key uppercased with `-` replaced by `_`.

### Local Development

Add these values to `.env` in the api root (the same way as the Database
Configuration above), or rely on the local JSON file. `docker-compose up` loads
`.env` automatically.

### Production Deployment

Provide the same values as environment variables through the deployment's secret
store.

Enjoy!
