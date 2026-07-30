from fastapi import FastAPI
from fastapi.responses import JSONResponse
from app.schemas import HealthCheckResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from app.controllers.wind_data_controller import router as wind_data_router
from app.middleware import AuditMiddleware, LoggingMiddleware
from app.exception_handlers import log_unhandled_exceptions, log_validation_errors
from textwrap import dedent

app = FastAPI(
    title="WindWatts API",
    version="2.0.0",
    root_path="/api",
    description=dedent(
        """
        Welcome to NLR's WindWatts API.

        - Rate limits: tiered - 10 / 100 / 1000 requests per minute per IP.
        - Base path: `/api`
        - Contact: windwatts@nlr.gov

        ## API

        - `GET /api/v1/{model}/windspeed` - Wind speed data
        - `GET /api/v1/{model}/production` - Energy production estimates
        - `GET /api/v1/{model}/timeseries` - Raw timeseries downloads
        - Supported models: `era5-quantiles`, `era5-timeseries`, `wtk-timeseries`, `ensemble-quantiles`

        Full interactive documentation: `/api/docs`

        Use the endpoints below to retrieve wind resource and production estimates.
        """
    ).strip(),
)

app.add_middleware(LoggingMiddleware)  # Logging middleware first
app.add_middleware(AuditMiddleware)  # Audit middleware second

app.add_exception_handler(Exception, log_unhandled_exceptions)
app.add_exception_handler(RequestValidationError, log_validation_errors)

origins = [
    "http://localhost",
    "https://windwatts-dev.stratus.nrel.gov",
    "https://windwatts-stage.stratus.nrel.gov",
    "https://windwatts-prod.stratus.nrel.gov",
    "https://windwatts-dev.stratus.nlr.gov",
    "https://windwatts-stage.stratus.nlr.gov",
    "https://windwatts-prod.stratus.nlr.gov",
    "https://windwatts.nrel.gov",
    "https://windwatts.nlr.gov",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1
app.include_router(wind_data_router, prefix="/v1", tags=["v1-wind-data"])


@app.get("/healthcheck", response_model=HealthCheckResponse)
def healthcheck():
    return JSONResponse({"status": "up"}, status_code=200)


# Serve generated OpenAPI JSON if present
@app.get("/openapi.json", include_in_schema=False, response_model=None)
def serve_openapi_json():
    return app.openapi()


handler = Mangum(app)
