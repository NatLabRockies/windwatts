# Backend Development (API)

The backend is a FastAPI application connected to a PostgreSQL database and AWS Athena/S3 for data retrieval.

## Setup

The project uses a standard Python structure.

### Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Makefile Targets

-   `make setup`: Initializes the project.
-   `make run`: Runs the webservice locally.

## Development

### Running Locally

```bash
uvicorn app.main:app --reload
```

### Data Sources & Database

The backend reads from two places:

- **PostgreSQL** (application data) via `DATABASE_URL`. Provisioned by Docker
  Compose with sensible defaults — see [Quickstart](02-quickstart.md); override in
  the **root** `.env` if needed.
- **AWS Athena / S3** (wind data) via `ConfigManager` — from environment variables
  (copy `windwatts-api/.env.sample` → `.env`), falling back to
  `app/config/windwatts_data_config.json`. For the full field and env-var
  reference, see [Deployment → Configuration](05-deployment.md#configuration).

Start Postgres and the rest of the stack with `docker compose up` from the repo root.

## Testing

To run tests:
```bash
pytest
```

## API Documentation

When the app is running, visit `/docs` (e.g., `http://localhost:8080/api/docs`) to see the auto-generated Swagger UI.

### API Endpoints

All endpoints are under the `/api/v1/{model}/` prefix.

| Endpoint | Description |
|---|---|
| `GET /api/v1/{model}/windspeed` | Wind speed data |
| `GET /api/v1/{model}/production` | Energy production estimates |
| `GET /api/v1/{model}/timeseries` | Raw timeseries downloads |

**Supported models**: `era5-quantiles`, `era5-timeseries`, `wtk-timeseries`, `ensemble-quantiles`, `wem-quantiles`
