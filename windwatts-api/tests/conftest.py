"""
Pytest configuration and fixtures for mocking external AWS dependencies.
"""

import os
import numpy as np
import pandas as pd
from unittest.mock import MagicMock, patch


# Global patch objects that need to persist
_boto3_patch = None
_mock_clients = {}
_windwatts_patches = []


def pytest_configure(config):
    """
    Pytest hook that runs very early, before any test collection.
    Patch fetchers and boto3 to prevent real AWS calls during module imports.
    """
    global _boto3_patch, _mock_clients, _windwatts_patches

    # Top-level config env vars (needed by ConfigManager._get_config_from_env)
    # Use clearly fake values so accidental real AWS calls are impossible
    os.environ["REGION_NAME"] = "us-east-1"
    os.environ["OUTPUT_LOCATION"] = "s3://test-fake-bucket/"
    os.environ["OUTPUT_BUCKET"] = "test-fake-bucket"
    os.environ["DATABASE"] = "test_fake_database"
    os.environ["ATHENA_WORKGROUP"] = "test_fake_workgroup"

    # Source-specific env vars using model keys
    os.environ["SOURCES_ENSEMBLE-QUANTILES_BUCKET_NAME"] = "test-fake-era5"
    os.environ["SOURCES_ENSEMBLE-QUANTILES_ATHENA_TABLE_NAME"] = "test_ensemble"
    os.environ["SOURCES_ENSEMBLE-QUANTILES_ALT_ATHENA_TABLE_NAME"] = ""
    os.environ["SOURCES_ERA5-QUANTILES_BUCKET_NAME"] = "test-fake-era5"
    os.environ["SOURCES_ERA5-QUANTILES_ATHENA_TABLE_NAME"] = "test_era5"
    os.environ["SOURCES_ERA5-QUANTILES_ALT_ATHENA_TABLE_NAME"] = ""
    os.environ["SOURCES_WTK-TIMESERIES_BUCKET_NAME"] = "test-fake-wtk"
    os.environ["SOURCES_WTK-TIMESERIES_ATHENA_TABLE_NAME"] = "test_wtk_1224"
    os.environ["SOURCES_WTK-TIMESERIES_ALT_ATHENA_TABLE_NAME"] = ""

    # Skip real data initialization (spatial lookups, AWS clients)
    os.environ["SKIP_DATA_INIT"] = "1"

    # Still need boto3 mocks for other AWS services (like secrets manager in config_manager)
    mock_s3_client = MagicMock()
    mock_athena_client = MagicMock()

    _mock_clients = {
        "athena": mock_athena_client,
        "s3": mock_s3_client,
        "secretsmanager": MagicMock(),
    }

    def mock_boto3_client(service_name, *args, **kwargs):
        if service_name in _mock_clients:
            return _mock_clients[service_name]
        return MagicMock()

    _boto3_patch = patch("boto3.client", side_effect=mock_boto3_client)
    _boto3_patch.start()


def pytest_collection_finish(session):
    """
    After all modules are imported and tests collected, inject mock fetchers
    into the controller's module-level dicts (which are empty due to SKIP_DATA_INIT=1).
    """
    from app.controllers import wind_data_controller as wdc
    from app.spatial.global_spatial_manager import init_spatial

    # Load real spatial lookups (reads local .npz files, no AWS needed)
    init_spatial()

    mock_athena_fetcher = MagicMock()

    def mock_fetch_data(lat, lng, height, period="all"):
        col = f"windspeed_{height}m"
        if period == "all":
            return {"global_avg": 8.60}
        elif period == "annual":
            return {
                "yearly_avg": [
                    {"year": 2020, col: 8.50},
                    {"year": 2021, col: 8.70},
                ]
            }
        elif period == "monthly":
            return {
                "monthly_avg": [
                    {"month": "Jan", col: 8.5},
                    {"month": "Feb", col: 8.7},
                ]
            }
        elif period == "hourly":
            return {
                "hourly_avg": [
                    {"hour": 0, col: 8.5},
                    {"hour": 1, col: 8.6},
                ]
            }
        return {"global_avg": 8.60}

    mock_athena_fetcher.fetch_data = MagicMock(side_effect=mock_fetch_data)

    # Realistic mock DataFrames for fetch_raw per model schema
    n_quantiles = 101
    probs = np.linspace(0.0, 1.0, n_quantiles)
    heights_data = {
        "windspeed_40m": np.linspace(2.0, 14.0, n_quantiles),
        "windspeed_60m": np.linspace(2.5, 15.0, n_quantiles),
        "windspeed_80m": np.linspace(3.0, 16.0, n_quantiles),
        "windspeed_100m": np.linspace(3.5, 17.0, n_quantiles),
        "probability": probs,
    }

    # ERA5: quantile_yearly — has year column
    era5_raw_df = pd.DataFrame({**heights_data, "year": [2020] * n_quantiles})

    # Ensemble: quantile_atemporal — NO year or mohr columns
    ensemble_raw_df = pd.DataFrame(heights_data)

    # WTK: aggregated_mohr — has mohr and year, no probability
    n_wtk = 288  # 12 months * 24 hours
    wtk_raw_df = pd.DataFrame(
        {
            "windspeed_40m": np.random.uniform(5, 12, n_wtk),
            "windspeed_80m": np.random.uniform(6, 14, n_wtk),
            "windspeed_100m": np.random.uniform(7, 15, n_wtk),
            "mohr": [m * 100 + h for m in range(1, 13) for h in range(24)],
            "year": [2020] * n_wtk,
        }
    )

    mock_athena_fetcher.fetch_raw = MagicMock(return_value=era5_raw_df)

    def mock_find_n_nearest(lat, lng, n_neighbors=1):
        locations = [
            ("046271", 39.903, -69.974),
            ("046272", 39.904, -69.98),
            ("046273", 39.905, -69.99),
            ("046274", 39.906, -70.00),
        ]
        return locations[:n_neighbors]

    mock_athena_fetcher.find_nearest_locations = MagicMock(
        side_effect=mock_find_n_nearest
    )

    # Create per-model fetchers with correct DataFrames
    mock_era5_fetcher = MagicMock()
    mock_era5_fetcher.fetch_data = MagicMock(side_effect=mock_fetch_data)
    mock_era5_fetcher.fetch_raw = MagicMock(return_value=era5_raw_df)
    mock_era5_fetcher.find_nearest_locations = MagicMock(
        side_effect=mock_find_n_nearest
    )

    mock_ensemble_fetcher = MagicMock()
    mock_ensemble_fetcher.fetch_data = MagicMock(side_effect=mock_fetch_data)
    mock_ensemble_fetcher.fetch_raw = MagicMock(return_value=ensemble_raw_df)
    mock_ensemble_fetcher.find_nearest_locations = MagicMock(
        side_effect=mock_find_n_nearest
    )

    mock_wtk_fetcher = MagicMock()
    mock_wtk_fetcher.fetch_data = MagicMock(side_effect=mock_fetch_data)
    mock_wtk_fetcher.fetch_raw = MagicMock(return_value=wtk_raw_df)
    mock_wtk_fetcher.find_nearest_locations = MagicMock(side_effect=mock_find_n_nearest)

    # Inject into the controller's module-level dicts
    wdc.athena_data_fetchers["era5-quantiles"] = mock_era5_fetcher
    wdc.athena_data_fetchers["ensemble-quantiles"] = mock_ensemble_fetcher
    wdc.athena_data_fetchers["wtk-timeseries"] = mock_wtk_fetcher
    wdc.data_fetcher_router.register_fetcher("athena_era5-quantiles", mock_era5_fetcher)
    wdc.data_fetcher_router.register_fetcher(
        "athena_ensemble-quantiles", mock_ensemble_fetcher
    )
    wdc.data_fetcher_router.register_fetcher("athena_wtk-timeseries", mock_wtk_fetcher)

    # Mock S3 fetcher for timeseries endpoints
    mock_s3_fetcher = MagicMock()
    mock_s3_fetcher.fetch_data = MagicMock(
        return_value=pd.DataFrame(
            {
                "windspeed_40m": [8.5, 8.7, 8.3, 8.6, 8.4],
                "windspeed_100m": [10.5, 10.2, 9.9, 10.3, 10.4],
                "winddirection_100m": [180, 190, 200, 210, 220],
                "time": pd.date_range("2020-01-01", periods=5, freq="h"),
            }
        )
    )
    for model_key in ["era5-timeseries", "wtk-timeseries"]:
        wdc.s3_data_fetchers[model_key] = mock_s3_fetcher
        wdc.data_fetcher_router.register_fetcher(f"s3_{model_key}", mock_s3_fetcher)


def pytest_unconfigure(config):
    """
    Cleanup: stop all patches after tests complete.
    """
    global _boto3_patch, _windwatts_patches
    if _boto3_patch:
        _boto3_patch.stop()
    for p in _windwatts_patches:
        p.stop()
    try:
        patch.stopall()
    except Exception:
        pass
